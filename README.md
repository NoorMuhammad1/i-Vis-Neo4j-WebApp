# i-Vis-Neo4j-WebApp

It is a small web application to perform some simple queries on a movie dataset stored in Neo4j graph database at backend and visualize the results using Cytoscape.js graph visualization library at frontend. We use the default movie dataset in Neo4j.

The code is put in the build branch of the repository in order to make any required changes comfortably before merging it with the main branch.

## Structure

The application consists of two parts (frontend and backend). The frontend of the application is implementation is done using React whereas the backend is made using express. A database file consisting of the default neo4j movie database is also provided.

## Deployment instructions

- Load the movie database file into neo4j database. Note down the username and the password used for the database.
- Locate the backend directory in the terminal and run the command `npm install .`. It will install all the necessary libraries required to run the backend application.
- Now create a .env file in the backend directory and put the following template along with their respective value into it:

```
HOST = "" // what worked for me was 127.0.0.1
DATABASE = "" // database name;
USERNAME = "" // username for the account;
PASSWORD = "" // password for the database;
```

- Locate the frontend directory in the terminal and run the command `npm install .` in it. It will install all the necessary libraries required to run the frontend application.
- Now from the backend part just run the command `npm start` to start the server.
- From the frontend part the same command, to view the frontend.
