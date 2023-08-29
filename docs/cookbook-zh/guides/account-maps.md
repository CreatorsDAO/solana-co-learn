# 账户映射

在编程中，我们经常使用映射（Map）这种数据结构，将一个键与某种值关联起来。键和值可以是任意类型的数据，键用作标识要保存的特定值的标识符。通过键，我们可以高效地插入、检索和更新这些值。

正如我们所了解的，Solana的账户模型要求程序数据和相关状态数据存储在不同的账户中。这些账户都有与之关联的地址，这本身就有映射的作用！在[这里][AccountCookbook]了解更多关于Solana账户模型的信息。

因此，将值存储在单独的账户中，以其地址作为检索值所需的键是有意义的。但这也带来了一些问题，比如：

*上述地址很可能不是理想的键，你可能难以记住并检索所需的值。

*上述地址是不同Keypair的公钥，每个公钥（或地址）都有与之关联的私钥。如果需要，这个私钥将用于对不同的指令进行签名，这意味着我们需要在某个地方存储私钥，这绝对不是推荐的做法！

这给许多Solana开发者带来了一个问题，即如何在他们的程序中实现类似`Map`的逻辑。让我们看看几种解决这个问题的方法。

## 派生PDA

PDA的全称是“程序派生地址” - [Program Derived Address][PDA]，简而言之，它们是从一组种子和程序ID（或地址）派生出来的地址。

PDAs的独特之处在于，这些地址不与任何私钥相关联。这是因为这些地址不位于ED25519曲线上。因此，只有派生此地址的程序可以使用提供的密钥和种子对指令进行签名。在这里了解更多信息。

现在我们对PDAs有了一个概念，让我们使用它们来映射一些账户！我们以一个博客程序作为示例，演示如何实现这一点。

在这个博客程序中，我们希望每个`User`都拥有一个`Blog`。这个博客可以有任意数量的`Posts`。这意味着我们将每个用户映射到一个博客，每个帖子映射到某个博客。

简而言之，用户和他/她的博客之间是`1:1`的映射，而博客和其帖子之间是`1:N`的映射。

对于`1:1`的映射，我们希望一个博客的地址仅从其用户派生，这样我们可以通过其权限（或用户）来检索博客。因此，博客的种子将包括其权限的密钥，可能还有一个前缀博客，作为类型标识符。

对于`1:N`的映射，我们希望每个帖子的地址不仅从它所关联的博客派生，还从另一个标识符派生，以区分博客中的多个帖子。在下面的示例中，每个帖子的地址是从博客的密钥、一个用于标识每个帖子的slug和一个前缀帖子派生出来的，作为类型标识符。

代码如下所示：

```rust
// anchor
#[derive(Accounts)]
#[instruction(blog_account_bump: u8)]
pub struct InitializeBlog<'info> {
    #[account(
        init,
        seeds = [
            b"blog".as_ref(),
            authority.key().as_ref()
        ],
        bump = blog_account_bump,
        payer = authority,
        space = Blog::LEN
    )]
    pub blog_account: Account<'info, Blog>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(post_account_bump: u8, post: Post)]
pub struct CreatePost<'info> {
    #[account(mut, has_one = authority)]
    pub blog_account: Account<'info, Blog>,

    #[account(
        init,
        seeds = [
            b"post".as_ref(),
            blog_account.key().as_ref(),
            post.slug.as_ref(),
        ],
        bump = post_account_bump,
        payer = authority,
        space = Post::LEN
    )]
    pub post_account: Account<'info, Post>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>
}
```

```rust
fn process_create_post(
    accounts: &[AccountInfo],
    slug: String,
    title: String,
    content: String,
    program_id: &Pubkey
) -> ProgramResult {
    if slug.len() > 10 || content.len() > 20 || title.len() > 50 {
        return Err(BlogError::InvalidPostData.into())
    }

    let account_info_iter = &mut accounts.iter();

    let authority_account = next_account_info(account_info_iter)?;
    let blog_account = next_account_info(account_info_iter)?;
    let post_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    if !authority_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let (blog_pda, _blog_bump) = Pubkey::find_program_address(
        &[b"blog".as_ref(), authority_account.key.as_ref()],
        program_id
    );
    if blog_pda != *blog_account.key || !blog_account.is_writable || blog_account.data_is_empty() {
        return Err(BlogError::InvalidBlogAccount.into())
    }

    let (post_pda, post_bump) = Pubkey::find_program_address(
        &[b"post".as_ref(), slug.as_ref(), authority_account.key.as_ref()],
        program_id
    );
    if post_pda != *post_account.key {
        return Err(BlogError::InvalidPostAccount.into())
    }

    let post_len: usize = 32 + 32 + 1 + (4 + slug.len()) + (4 + title.len()) + (4 + content.len());

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(post_len);

    let create_post_pda_ix = &system_instruction::create_account(
        authority_account.key,
        post_account.key,
        rent_lamports,
        post_len.try_into().unwrap(),
        program_id
    );
    msg!("Creating post account!");
    invoke_signed(
        create_post_pda_ix,
        &[
            authority_account.clone(),
            post_account.clone(),
            system_program.clone()
        ],
        &[&[
            b"post".as_ref(),
            slug.as_ref(),
            authority_account.key.as_ref(),
            &[post_bump]
        ]]
    )?;

    let mut post_account_state = try_from_slice_unchecked::<Post>(&post_account.data.borrow()).unwrap();
    post_account_state.author = *authority_account.key;
    post_account_state.blog = *blog_account.key;
    post_account_state.bump = post_bump;
    post_account_state.slug = slug;
    post_account_state.title = title;
    post_account_state.content = content;

    msg!("Serializing Post data");
    post_account_state.serialize(&mut &mut post_account.data.borrow_mut()[..])?;


    let mut blog_account_state = Blog::try_from_slice(&blog_account.data.borrow())?;
    blog_account_state.post_count += 1;

    msg!("Serializing Blog data");
    blog_account_state.serialize(&mut &mut blog_account.data.borrow_mut()[..])?;

    Ok(())
}

fn process_init_blog(
    accounts: &[AccountInfo],
    program_id: &Pubkey
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let authority_account = next_account_info(account_info_iter)?;
    let blog_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    if !authority_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let (blog_pda, blog_bump) = Pubkey::find_program_address(
        &[b"blog".as_ref(), authority_account.key.as_ref()],
        program_id
    );
    if blog_pda != *blog_account.key {
        return Err(BlogError::InvalidBlogAccount.into())
    }

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(Blog::LEN);

    let create_blog_pda_ix = &system_instruction::create_account(
        authority_account.key,
        blog_account.key,
        rent_lamports,
        Blog::LEN.try_into().unwrap(),
        program_id
    );
    msg!("Creating blog account!");
    invoke_signed(
        create_blog_pda_ix,
        &[
            authority_account.clone(),
            blog_account.clone(),
            system_program.clone()
        ],
        &[&[
            b"blog".as_ref(),
            authority_account.key.as_ref(),
            &[blog_bump]
        ]]
    )?;

    let mut blog_account_state = Blog::try_from_slice(&blog_account.data.borrow())?;
    blog_account_state.authority = *authority_account.key;
    blog_account_state.bump = blog_bump;
    blog_account_state.post_count = 0;
    blog_account_state.serialize(&mut &mut blog_account.data.borrow_mut()[..])?;


    Ok(())
}

```

在客户端，你可以使用`PublicKey.findProgramAddress()`来获取所需的`Blog` 和`Post`账户地址，然后将其传递给`connection.getAccountInfo()`来获取账户数据。下面是一个示例：


```ts
async () => {
  const connection = new Connection("http://localhost:8899", "confirmed");

  const [blogAccount] = await PublicKey.findProgramAddress(
    [Buffer.from("blog"), user.publicKey.toBuffer()],
    MY_PROGRAM_ID
  );

  const [postAccount] = await PublicKey.findProgramAddress(
    [Buffer.from("post"), Buffer.from("slug-1"), user.publicKey.toBuffer()],
    MY_PROGRAM_ID
  );

  const blogAccountInfo = await connection.getAccountInfo(blogAccount);
  const blogAccountState = BLOG_ACCOUNT_DATA_LAYOUT.decode(
    blogAccountInfo.data
  );
  console.log("Blog account state: ", blogAccountState);

  const postAccountInfo = await connection.getAccountInfo(postAccount);
  const postAccountState = POST_ACCOUNT_DATA_LAYOUT.decode(
    postAccountInfo.data
  );
  console.log("Post account state: ", postAccountState);
};

```

## 单个映射账户

另一种实现映射的方法是在单个账户中显式存储一个`BTreeMap`数据结构。这个账户的地址本身可以是一个PDA，或者是生成的Keypair的公钥。

这种账户映射的方法并不理想，原因如下：

*首先，你需要初始化存储`BTreeMap`的账户，然后才能向其中插入必要的键值对。然后，你还需要将这个账户的地址存储在某个地方，以便每次更新时进行更新。

*账户存在内存限制，每个账户的最大大小为10兆字节，这限制了`BTreeMap`存储大量键值对的能力。

因此，在考虑你的用例后，可以按照以下方式实现这种方法：


```rust
fn process_init_map(accounts: &[AccountInfo], program_id: &Pubkey) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let authority_account = next_account_info(account_info_iter)?;
    let map_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    if !authority_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature)
    }

    let (map_pda, map_bump) = Pubkey::find_program_address(
        &[b"map".as_ref()],
        program_id
    );

    if map_pda != *map_account.key || !map_account.is_writable || !map_account.data_is_empty() {
        return Err(BlogError::InvalidMapAccount.into())
    }

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(MapAccount::LEN);

    let create_map_ix = &system_instruction::create_account(
        authority_account.key,
        map_account.key,
        rent_lamports,
        MapAccount::LEN.try_into().unwrap(),
        program_id
    );

    msg!("Creating MapAccount account");
    invoke_signed(
        create_map_ix,
        &[
            authority_account.clone(),
            map_account.clone(),
            system_program.clone()
        ],
        &[&[
            b"map".as_ref(),
            &[map_bump]
        ]]
    )?;

    msg!("Deserializing MapAccount account");
    let mut map_state = try_from_slice_unchecked::<MapAccount>(&map_account.data.borrow()).unwrap();
    let empty_map: BTreeMap<Pubkey, Pubkey> = BTreeMap::new();

    map_state.is_initialized = 1;
    map_state.map = empty_map;

    msg!("Serializing MapAccount account");
    map_state.serialize(&mut &mut map_account.data.borrow_mut()[..])?;

    Ok(())
}

fn process_insert_entry(accounts: &[AccountInfo], program_id: &Pubkey) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();

    let a_account = next_account_info(account_info_iter)?;
    let b_account = next_account_info(account_info_iter)?;
    let map_account = next_account_info(account_info_iter)?;

    if !a_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature)
    }

    if map_account.data.borrow()[0] == 0 || *map_account.owner != *program_id {
        return Err(BlogError::InvalidMapAccount.into())
    }

    msg!("Deserializing MapAccount account");
    let mut map_state = try_from_slice_unchecked::<MapAccount>(&map_account.data.borrow())?;

    if map_state.map.contains_key(a_account.key) {
        return Err(BlogError::AccountAlreadyHasEntry.into())
    }

    map_state.map.insert(*a_account.key, *b_account.key);

    msg!("Serializing MapAccount account");
    map_state.serialize(&mut &mut map_account.data.borrow_mut()[..])?;

    Ok(())
}

```

上述程序的客户端测试代码可能如下所示：


```ts
const insertABIx = new TransactionInstruction({
  programId: MY_PROGRAM_ID,
  keys: [
    {
      pubkey: userA.publicKey,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: userB.publicKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: mapKey,
      isSigner: false,
      isWritable: true,
    },
  ],
  data: Buffer.from(Uint8Array.of(1)),
});

const insertBCIx = new TransactionInstruction({
  programId: MY_PROGRAM_ID,
  keys: [
    {
      pubkey: userB.publicKey,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: userC.publicKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: mapKey,
      isSigner: false,
      isWritable: true,
    },
  ],
  data: Buffer.from(Uint8Array.of(1)),
});

const insertCAIx = new TransactionInstruction({
  programId: MY_PROGRAM_ID,
  keys: [
    {
      pubkey: userC.publicKey,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: userA.publicKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: mapKey,
      isSigner: false,
      isWritable: true,
    },
  ],
  data: Buffer.from(Uint8Array.of(1)),
});

const tx = new Transaction();
tx.add(initMapIx);
tx.add(insertABIx);
tx.add(insertBCIx);
tx.add(insertCAIx);
```



[AccountCookbook]: https://solanacookbook.com/core-concepts/accounts.html
[PDA]: https://solanacookbook.com/references/accounts.html#program-derived-address
[CPI]: https://solanacookbook.com/references/programs.html#create-a-program-derived-address
