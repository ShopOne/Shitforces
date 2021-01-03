# Shitforces

くそなぞなぞコンテストサイトです。<br>

## 実行
IntelliJのUltimate(他のIDEは未確認です)ならプロジェクト開いて実行ボタンで実行できます。<br>
プロジェクトルートで  ./gradlew bootrun も動きます

## 環境設定
環境変数として以下を設定する必要があります

- DATABASE_URL(jdbc:postgresql://localhost:5432/db 等)
- DATABASE_USER(shop_one 等)
- DATABASE_PASSWORD(password 等)

また、事前にpostgresqlで事前に作る必要があります
