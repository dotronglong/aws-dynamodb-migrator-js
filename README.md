# aws-dynamodb-migrator-js
Quick and easy migration for AWS DynamoDB (local development)

## Getting Started

- Install `aws-dynamodb-migrator`

```bash
npm install -g aws-dynamodb-migrator
```

- Start DynamoDB local container

```bash
docker-compose up -d
```

- Run migration

```bash
aws-dynamodb-migrator --region us-west-2 --endpoint http://localhost:28822 --path ./fixtures
```

## Schema

See `fixtures/schema.json` for example schema file