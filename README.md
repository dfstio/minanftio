# Mina NFT
frontend & functions repo

## Website
https://minanft.io

## Library on NPM
https://www.npmjs.com/package/minanft

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


 
 