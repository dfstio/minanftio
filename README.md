# MinaNFT Frontend

The MinaNFT project is an innovative Non-Fungible Token (NFT) platform that integrates the unique privacy features of the Mina blockchain with advanced AI technology. It's designed to redefine the NFT space by offering a range of functionalities that go beyond traditional NFT capabilities.

## Features

- [Explore](https://minanft.io/explore) all the NFTs
- [Explore](https://minanft.io/posts) all the posts
- [Create](https://minanft.io/create) NFTs and posts
- [Prove](https://minanft.io/proofs) public and private key-value pairs
- [Verify](https://minanft.io/proofs) public and private key-value pairs off-chain and on-chain
- [CLI tool helpers](https://minanft.io/tools)
- [Corporate onboarding](https://minanft.io/corporate)
- [Billing reports](https://minanft.io/corporate/billing)
- Supported languages: English, Turkish, Italian, Spanish, French

## Links

### Documentation

https://docs.minanft.io

### Frontend Website repo

https://github.com/dfstio/minanftio

## Winston configuration

Create user with AWS IAM Policy:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "logs:PutLogEvents",
                "logs:DescribeLogStreams",
                "logs:CreateLogGroup",
                "logs:CreateLogStream"
            ],
            "Resource": "arn:aws:logs:eu-west-1:YOUR_AWS_ACCOUNT_ID:log-group:winston:*"
        }
    ]
}
```

and update WINSTON... environment variables with your AWS credentials and region
