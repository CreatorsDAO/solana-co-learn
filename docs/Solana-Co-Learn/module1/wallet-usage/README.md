# Solana钱包使用

Solana的钱包有很多，比如很有的Phantom钱包。但是这里我不在推荐使用Phantom，因为他对于开发者
来说，不是很友好。

在本地开发的时候不支持本地RPC地址，只能使用Solana官方的测试网，这样的话，开发者在本地开发的时候就不可以。这也是我推荐`Backpack`钱包的原因。

## 下载Backpack钱包

下载地址：[`https://www.backpack.app/`](https://www.backpack.app/`) 是这个。点击里面的Download，然后选择自己的浏览器插件。

目前只支持Chrome和Brave, Arc浏览器。移动端还在开发。


## 创建账户

下载完之后这个就是登录界面，点击`Create Account`创建账户。

![](./backpack-create-account.png)


下面是Claim 账户的名字, 输入你自已要创建的账户名字，然后点击`Claim Name`。

![](./backpack-cliam-name.png)

之后会跳转到创建新的钱包或者导入私钥的界面，这里我们选择创建新的钱包。

![](./backpack-create-new-wallet.png)

之后出现助记词界面，我们这里可以保存自己的助记词到本地，然后点击下一步。

![](./backpack-mnemonic.png)

因为backpack也是一个多链钱包，这里我们选择Solana，然后点击下一步。

![](./backpack-chose-solana.png)

## 设置自定义的RPC Endpoint

账户创建好了下面我们开始设置自定义的`RPC Endpoint`，点击右上角的设置按钮，然后选择`Perference`。

![](./backpack-setting.png)

![](./backpack-setting1.png)

之后我们点击Perference。

![](./backpack-perference.png)

可以看到这里有两个网络一个是Solana一个是以太坊，这里我们选择Solana。

![](./backpack-custom-rpc.png)

这里就是设置自定义rpc的地方，这里我们选择了`localnet`。

对于`Custom`，你可以自定以你的Rpc地址，除了官方提供的`testnet`或者`mainbeta`的地址，你可以去`quikcnode`或者`helius`申请你自己的rpc地址使用。

## Reference

- Quicknode
- helius
