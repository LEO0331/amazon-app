# ECommerce Website
![Eshop](/template/ProfilePic.jpg)
This is an e-commerce website similar to Amazon using MERN stack (MongoDB, ExpressJS, React and Node.JS).
## Demo
- 👉 Heroku : [https://my-ecommence-app.herokuapp.com/](https://my-ecommence-app.herokuapp.com/)
## Run Locally
### 1. Clone repo
```
$ git clone https://github.com/LEO0331/amazon-app.git
$ cd amazona
```
### 2. Setup MongoDB
- Local MongoDB
  - Install it from [here](https://www.mongodb.com/try/download/community)
  - Create .env file in the root folder
  - Set MONGODB_URL=mongodb://localhost/amazona  
- Atlas Cloud MongoDB
  - Create database at [https://cloud.mongodb.com](https://cloud.mongodb.com)
  - Create .env file in root folder
  - Set MONGODB_URL=mongodb+srv://your-db-connection
### 3. Run Backend
```
$ npm install
$ npm start
```
### 4. Run Frontend
```
# open another/new terminal
$ cd frontend
$ npm install
$ npm start
```
### 5. Seed Users and Products
- Run on chrome: http://localhost:5000/api/users/seed
- Returns admin/seller/customer email and password
- Run on chrome: http://localhost:5000/api/products/seed
- Creates 6 sample products
```
Remove await Product.remove({}) at productRouter.js and await User.remove({}) at userRouter.js after seeding
```
