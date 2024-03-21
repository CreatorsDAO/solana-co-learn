# 简介

这节课深入讲解了我们在“反序列化账户数据”课程中使用的一些RPC调用功能。为了节省计算时间，您可以在不获取数据的情况下获取大量账户，通过筛选它们仅返回一个公钥数组。一旦您有了筛选后的公钥列表，您可以对它们排序并获取它们所属的账户数据。

# 正文

您可能已经注意到，在上一课中，尽管我们可以获取并显示账户数据列表，但我们无法精确控制要获取的账户数量或它们的顺序。在这节课中，我们将了解一些`getProgramAccounts`函数的配置选项，这些选项可以实现分页、排序账户和筛选等功能。

### 只获取您需要的数据 

想象一下，我们在过去课程中开发的电影评论应用有四百万条电影评论，平均每条评论500字节。这将使所有评论账户的总下载量超过2GB。显然，这不是您希望前端在每次页面刷新时都下载的内容。

幸运的是，您用来获取所有账户的`getProgramAccounts`函数接受一个配置对象作为参数。其中一个配置选项是`dataSlice`，它允许您提供两样东西：

- `offset` - 从数据缓冲区开始的偏移量来开始切片
- `length` - 从提供的偏移量开始返回的字节数量

当您在配置对象中包含一个`dataSlice`时，该函数只会返回您指定的数据缓冲区的子集。

#### 分页账户 

这在分页时非常有用。如果您想要显示所有账户的列表，但有太多账户，您不想一次性拉取所有数据，您可以使用`{ offset: 0, length: 0 }`的`dataSlice`来获取所有账户，但不获取它们的数据。然后您可以将结果映射到一个账户密钥列表，只在需要时才获取它们的数据。

```
const accountsWithoutData = await connection.getProgramAccounts(
  programId,
  {
    dataSlice: { offset: 0, length: 0 }
  }
)

const accountKeys = accountsWithoutData.map(account => account.pubkey)
```

有了这些密钥列表，您可以使用`getMultipleAccountsInfo`方法分页获取账户数据：

```
const paginatedKeys = accountKeys.slice(0, 10)
const accountInfos = await connection.getMultipleAccountsInfo(paginatedKeys)
const deserializedObjects = accountInfos.map((accountInfo) => {
  // 在这里放置反序列化accountInfo.data的逻辑
})
```

#### 排序账户 

`dataSlice`选项在需要在分页时排序账户列表时也很有帮助。您仍然不想一次性获取所有数据，但您确实需要所有的密钥和一种方法来提前排序它们。在这种情况下，您需要了解账户数据的布局，并配置数据切片以仅为排序使用所需的数据。

例如，您可能有一个这样存储联系信息的账户：

- `initialized` 作为一个布尔值
- `phoneNumber` 作为一个无符号的64位整数
- `firstName` 作为一个字符串
- `secondName` 作为一个字符串

如果您想根据用户的名字按字母顺序对所有账户密钥进行排序，您需要找出名字开始的偏移量。第一个字段`initialized`占用第一个字节，然后`phoneNumber`又占用了8个字节，所以`firstName`字段从偏移量1 + 8 = 9开始。然而，Borsh中动态数据字段使用前4个字节来记录数据的长度，所以我们可以再跳过4个字节，使偏移量为13。

然后您需要确定切片长度。由于长度是可变的，在获取数据之前我们无法确切知道。但是您可以选择一个足够大以覆盖大多数情况、又足够小以不至于太麻烦的长度来获取。对于大多数名字来说，15个字节已经足够，但即使对于百万用户来说，这也会导致一个足够小的下载量。

一旦您用给定的数据切片获取了账户，您可以在将其映射到一个公钥数组之前使用`sort`方法对数组进行排序。

```
const accounts = await connection.getProgramAccounts(
  programId,
  {
    dataSlice: { offset: 13, length: 15 }
  }
)

accounts.sort( (a, b) => {
  const lengthA = a.account.data.readUInt32LE(0)
  const lengthB = b.account.data.readUInt32LE(0)
  const dataA = a.account.data.slice(4, 4 + lengthA)
  const dataB = b.account.data.slice(4, 4 + lengthB)
  return dataA.compare(dataB)
})

const accountKeys = accounts.map(account => account.pubkey)
```

请注意，在上面的代码片段中，我们不是直接比较给定的数据。这是因为对于像字符串这样的动态大小类型，Borsh在开始处放置一个无符号的32位（4字节）整数来指示表示该字段的数据的长度。因此，为了直接比较名字，我们需要获取每个名字的长度，然后创建一个有4字节偏移量和适当长度的数据切片。

使用过滤器只检索特定账户 每个账户限制接收的数据量是很好的，但如果您只想返回满足特定条件的账户而不是所有账户怎么办？这就是`filters`配置选项的用武之地。这个选项是一个数组，可以包含以下匹配对象：

- ```
  memcmp
  ```

   \- 将提供的一系列字节与特定偏移处的程序账户数据进行比较。字段包括：

  - `offset` - 在比较数据之前偏移到程序账户数据中的数字
  - `bytes` - 表示要匹配的数据的 base-58 编码字符串；限制为少于129字节

- `dataSize` - 将程序账户数据长度与提供的数据大小进行比较

这些让您可以基于匹配数据和/或总数据大小进行过滤。

例如，您可以通过包含一个`memcmp`过滤器来搜索联系人列表：

```
javascriptCopy code
async function fetchMatchingContactAccounts(connection: web3.Connection, search: string): Promise<(web3.AccountInfo<Buffer> | null)[]> {
  const accounts = await connection.getProgramAccounts(
    programId,
    {
      dataSlice: { offset: 0, length: 0 },
      filters: [
        {
          memcmp:
            {
              offset: 13,
              bytes: bs58.encode(Buffer.from(search))
            }
        }
      ]
    }
  )
}
```

在上面的例子中需要注意两点：

1. 我们将偏移量设置为13，因为我们之前确定了数据布局中`firstName`的偏移量为9，而我们想要额外跳过表示字符串长度的前4个字节。
2. 我们使用第三方库`bs58`对搜索项进行 base-58 编码。您可以使用`npm install bs58`安装它。

# 实验 

还记得我们在过去两课中开发的电影评论应用吗？我们将对评论列表进行分页，对评论进行排序，使其不那么随机，并添加一些基本搜索功能，使其更加丰富。如果您还没看过前几课，也没关系 - 只要您具备必要的知识，即使您还没有在这个特定项目中工作，您也应该能够跟上实验室的内容。

### 1.下载起始代码 如果您没有完成上一课的实验室，或者只是想确保没有错过任何内容，您可以下载起始代码。

该项目是一个相当简单的 Next.js 应用程序。它包括我们在“钱包”课程中创建的`WalletContextProvider`、用于显示电影评论的`Card`组件、显示评论列表的`MovieList`组件、用于提交新评论的`Form`组件，以及包含`Movie`对象类定义的`Movie.ts`文件。

### 2.为评论添加分页 

首先，让我们创建一个封装获取账户数据代码的空间。创建一个新文件`MovieCoordinator.ts`并声明一个`MovieCoordinator`类。然后我们将从`MovieList`中移动`MOVIE_REVIEW_PROGRAM_ID`常量到这个新文件，因为我们将引用它

```
javascriptCopy code
const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN'

export class MovieCoordinator { }
```

现在我们可以使用`MovieCoordinator`来创建一个分页实现。在我们开始之前的一个快速说明：这将是尽可能简单的分页实现，以便我们可以专注于与 Solana 账户交互的复杂部分。对于生产应用程序，您可以（也应该）做得更好。

说完这个，让我们创建一个静态属性`accounts`类型为`web3.PublicKey[]`，一个静态函数`prefetchAccounts(connection: web3.Connection)`，和一个静态函数`fetchPage(connection: web3.Connection, page: number, perPage: number): Promise<Movie[]>`。您还需要导入`@solana/web3.js`和`Movie`。

```
javascriptCopy code
import * as web3 from '@solana/web3.js'
import { Movie } from '../models/Movie'

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN'

export class MovieCoordinator {
  static accounts: web3.PublicKey[] = []

  static async prefetchAccounts(connection: web3.Connection) {

  }

  static async fetchPage(connection: web3.Connection, page: number, perPage: number): Promise<Movie[]> {

  }
}
```

进行分页的关键是预先获取所有没有数据的账户。让我们填充`prefetchAccounts`的主体来做这件事，并将检索到的公钥设置到静态`accounts`属性。

```
javascriptCopy code
static async prefetchAccounts(connection: web3.Connection) {
  const accounts = await connection.getProgramAccounts(
    new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID),
    {
      dataSlice: { offset: 0, length: 0 },
    }
  )

  this.accounts = accounts.map(account => account.pubkey)
}
```

现在，让我们填充`fetchPage`方法。首先，如果账户尚未预先获取，我们需要这样做。然后，我们可以获取对应于请求页面的账户公钥，并调用`connection.getMultipleAccountsInfo`。最后，我们反序列化账户数据并返回相应的`Movie`对象。

```
static async fetchPage(connection: web3.Connection, page: number, perPage: number): Promise<Movie[]> {
  if (this.accounts.length === 0) {
    await this.prefetchAccounts(connection)
  }

  const paginatedPublicKeys = this.accounts.slice(
    (page - 1) * perPage,
    page * perPage,
  )

  if (paginatedPublicKeys.length === 0) {
    return []
  }

  const accounts = await connection.getMultipleAccountsInfo(paginatedPublicKeys)

  const movies = accounts.reduce((accum: Movie[], account) => {
    const movie = Movie.deserialize(account?.data)
    if (!movie) {
      return accum
    }

    return [...accum, movie]
  }, [])

  return movies
}
```

现在我们已经完成了上述步骤，我们可以重新配置`MovieList`以使用这些方法。在`MovieList.tsx`中，添加`const [page, setPage] = useState(1)`靠近现有的`useState`调用。然后，更新`useEffect`以调用`MovieCoordinator.fetchPage`而不是内联获取账户。

```
javascriptCopy code
const { connection } = useConnection()
const [movies, setMovies] = useState<Movie[]>([])
const [page, setPage] = useState(1)

useEffect(() => {
  MovieCoordinator.fetchPage(
    connection,
    page,
    10
  ).then(setMovies)
}, [page])
```

最后，我们需要在列表底部添加按钮来导航到不同的页面：

```
javascriptCopy code
return (
  <div>
    {
      movies.map((movie, i) => <Card key={i} movie={movie} /> )
    }
    <Center>
      <HStack w='full' mt={2} mb={8} ml={4} mr={4}>
        {
          page > 1 && <Button onClick={() => setPage(page - 1)}>Previous</Button>
        }
        <Spacer />
        {
          MovieCoordinator.accounts.length > page * 2 &&
            <Button onClick={() => setPage(page + 1)}>Next</Button>
        }
      </HStack>
    </Center>
  </div>
)
```

到目前为止，您应该能够运行项目并在页面之间点击！

### 3.按标题字母顺序排列评论 

如果您查看评论，可能会注意到它们没有任何特定的顺序。我们可以通过在数据切片中添加足够的数据来帮助我们进行排序来解决这个问题。电影评论数据缓冲区中的各种属性布局如下：

- `initialized` - 无符号8位整数；1字节
- `rating` - 无符号8位整数；1字节
- `title` - 字符串；未知字节数
- `description` - 字符串；未知字节数

基于此，我们需要提供给数据切片的偏移量来访问`title`是2。然而，长度是不确定的，所以我们可以只提供看起来合理的长度。我会使用18，因为这将涵盖大多数标题的长度，而不会每次都获取太多数据。

一旦我们修改了`getProgramAccounts`中的数据切片，我们还需要对返回的数组进行实际排序。为此，我们需要比较数据缓冲区实际对应`title`的部分。Borsh中动态字段的前4个字节用于存储该字段的字节长度。所以在任何给定的按我们上述讨论的方式切片的缓冲区数据中，字符串部分是`data.slice(4, 4 + data[0])`。

现在我们已经思考过这个问题，让我们修改`MovieCoordinator`中`prefetchAccounts`的实现：

```
javascriptCopy code
static async prefetchAccounts(connection: web3.Connection, filters: AccountFilter[]) {
  const accounts = await connection.getProgramAccounts(
    new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID),
    {
      dataSlice: { offset: 2, length: 18 },
    }
  )

  accounts.sort( (a, b) => {
    const lengthA = a.account.data.readUInt32LE(0)
    const lengthB = b.account.data.readUInt32LE(0)
    const dataA = a.account.data.slice(4, 4 + lengthA)
    const dataB = b.account.data.slice(4, 4 + lengthB)
    return dataA.compare(dataB)
  })

  this.accounts = accounts.map(account => account.pubkey)
}
```

就这样，您应该能够运行应用并看到按字母顺序排列的电影评论列表。

### 4.添加搜索 

我们将要对这个应用程序做的最后一件事是添加一些基本的搜索功能。让我们向`prefetchAccounts`添加一个搜索参数，并重新配置函数的主体以使用它。

我们可以使用`getProgramAccounts`配置参数的`filters`属性根据特定数据过滤账户。标题字段的偏移量为2，但标题的前4个字节是标题的长度，所以字符串本身的实际偏移量是6。请记住，字节需要进行base 58编码，因此让我们安装并导入`bs58`。

```
import bs58 from 'bs58'

...

static async prefetchAccounts(connection: web3.Connection, search: string) {
  const accounts = await connection.getProgramAccounts(
    new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID),
    {
      dataSlice: { offset: 2, length: 18 },
      filters: search === '' ? [] : [
        {
          memcmp:
            {
              offset: 6,
              bytes: bs58.encode(Buffer.from(search))
            }
        }
      ]
    }
  )

  accounts.sort( (a, b) => {
    const lengthA = a.account.data.readUInt32LE(0)
    const lengthB = b.account.data.readUInt32LE(0)
    const dataA = a.account.data.slice(4, 4 + lengthA)
    const dataB = b.account.data.slice(4, 4 + lengthB)
    return dataA.compare(dataB)
  })

  this.accounts = accounts.map(account => account.pubkey)
}
```

现在，在`fetchPage`中添加一个搜索参数，并更新其对`prefetchAccounts`的调用以传递它。我们还需要向`fetchPage`添加一个`reload`布尔参数，以便每次搜索值更改时都强制刷新账户预获取。

```
static async fetchPage(connection: web3.Connection, page: number, perPage: number, search: string, reload: boolean = false): Promise<Movie[]> {
  if (this.accounts.length === 0 || reload) {
    await this.prefetchAccounts(connection, search)
  }

  const paginatedPublicKeys = this.accounts.slice(
    (page - 1) * perPage,
    page * perPage,
  )

  if (paginatedPublicKeys.length === 0) {
    return []
  }

  const accounts = await connection.getMultipleAccountsInfo(paginatedPublicKeys)

  const movies = accounts.reduce((accum: Movie[], account) => {
    const movie = Movie.deserialize(account?.data)
    if (!movie) {
      return accum
    }

    return [...accum, movie]
  }, [])

  return movies
}
```

有了这些设置，让我们更新`MovieList`中的代码以正确调用它。

首先，在其他`useState`调用附近添加`const [search, setSearch] = useState('')`。然后更新`useEffect`中对`MovieCoordinator.fetchPage`的调用，以传递搜索参数，并在`search !== ''`时重新加载。

```
const { connection } = useConnection()
const [movies, setMovies] = useState<Movie[]>([])
const [page, setPage] = useState(1)
const [search, setSearch] = useState('')

useEffect(() => {
  MovieCoordinator.fetchPage(
    connection,
    page,
    2,
    search,
    search !== ''
  ).then(setMovies)
}, [page, search])
```

最后，添加一个搜索栏，它将设置`search`的值：

```
return (
  <div>
    <Center>
      <Input
        id='search'
        color='gray.400'
        onChange={event => setSearch(event.currentTarget.value)}
        placeholder='Search'
        w='97%'
        mt={2}
        mb={2}
      />
    </Center>

    ...

  </div>
)
```

就是这样！应用程序现在具有有序的评论、分页和搜索功能。

这里包含了大量内容，但您已经成功完成了。如果您需要更多时间来理解这些概念，请随时重读对您来说最具挑战性的部分，并/或查看解决方案代码。

# 挑战 

现在轮到您自己尝试这些操作。使用上一课中的“学生介绍”应用，添加分页、按名字字母顺序排列和按名字搜索功能。

![Screenshot of Student Intros frontend](https://www.soldev.app/assets/student-intros-frontend.png)

您可以从头开始构建，也可以下载起始代码。 

通过预先获取没有数据的账户，然后仅在需要时获取每个账户的账户数据，为项目添加分页功能。 

按名字字母顺序排列应用中显示的账户。 

添加通过学生名字搜索介绍的功能。 

这是具有挑战性的。如果您遇到困难，请随时参考解决方案代码。

通过这样做，您就完成了模块1！您的体验如何？欢迎分享一些快速反馈，以便我们继续改进课程！

像往常一样，发挥创造力，将这些挑战变得更有创意！