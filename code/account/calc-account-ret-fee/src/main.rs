// 计算账户费用
// 在Solana上保持账户活跃会产生一项存储费用，称为 租金/rent。
// 通过存入至少两年租金的金额，你可以使账户完全免除租金收取。
// 对于费用的计算，你需要考虑你打算在账户中存储的数据量。
use solana_client::rpc_client::RpcClient;
use solana_sdk::commitment_config::CommitmentConfig;

fn main() {
    let rpc_url = String::from("http://127.0.0.1:8899");
    let connection = RpcClient::new_with_commitment(rpc_url, CommitmentConfig::confirmed());
    let data_length = 1500;

    let rent_exemption_amount = connection
        .get_minimum_balance_for_rent_exemption(data_length)
        .unwrap();

    println!("rent exemption amount: {}", rent_exemption_amount);
}
