import express from "express";
import ejs from "ejs";
import { MongoClient, ServerApiVersion } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";


const app = express();
const port = 8082;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))

const uri = "mongodb+srv://kzaid0767:Reometry123$@cluster0.8d1aj.mongodb.net/students-database";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

app.get("/", (req, res) => {
    res.render("index");
});

const connectToDatabase = async () => {
    try {
        await client.connect();
        const database = client.db("all-students");
        const gradeBook = database.collection("gradebook");
        
        console.log('connected to database');
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            }
};
            
connectToDatabase();

app.get("/search", async (req, res) => {
    let { firstname, lastname, grade } =  req.query;
    //const filter = { firstname: firstname, lastname: lastname, grade: grade };
    firstname = firstname.trim().toLowerCase();
    lastname = lastname.trim().toLowerCase();
    try {
        const database = client.db("all-students");
        const gradeBook = database.collection("gradebook");
        const result = await gradeBook.find({$or: [{firstname: firstname}, {lastname: lastname}, {grade: grade}]}).toArray();
        console.log(result);
        res.render("result", { result });
    } catch (error) {
        // console.error("Error searching for student:", error);
        const errorMessage = "Error searching for student";
        console.log(errorMessage);
        // res.status(500).send("Error searching for student");
        res.render("result", { errorMessage:`${errorMessage}` });
    }
    
})     
 

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});