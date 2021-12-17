# Shitforces

くそなぞなぞコンテストサイトです。<br>

## 実行
### バックエンド開発者用
IntelliJのUltimate(他のIDEは未確認です)ならプロジェクト開いて実行ボタンで実行できます。<br>
プロジェクトルートで  ./gradlew bootrun も動きます。

### フロントエンド開発者用
ReactのFast Refleshを有効にできます。以下のコマンドを使用してください。

 - `make front`: クライアントの開発サーバーを起動します。
 - `make back`: バックエンドを起動します。
 - `make server`: PostgreSQLを起動します。 

## 環境設定
ローカルで動かす場合、環境変数として以下を設定する必要があります

- DATABASE_URL(jdbc:postgresql://localhost:5432/db 等)
- DATABASE_USER(shop_one 等)
- DATABASE_PASSWORD(password 等)

また、事前にpostgresqlでデータベースを作る必要があります
