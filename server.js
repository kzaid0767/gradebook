import express from "express";
import ejs from "ejs";
import { MongoClient, ServerApiVersion } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";


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

app.get("/forsearching", (req, res) => {
    res.render("forSearching");
});

app.get("/foradding", (req, res) => {
    res.render("forAdding");
});

app.get("/forupdating", (req, res) => {
    res.render("forUpdating");
});

app.get("/fordeleting", (req, res) => {
    res.render("forDeleting");
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

/* Searching for a student from the database */
app.get("/search", async (req, res) => {
    let { firstname, lastname, grade } =  req.query;
    //const filter = { firstname: firstname, lastname: lastname, grade: grade };
    firstname = firstname.trim().toLowerCase();
    lastname = lastname.trim().toLowerCase();
    try {
        const database = client.db("all-students");
        const gradeBook = database.collection("gradebook");
        const result = await gradeBook.find({$or: [{firstname: firstname}, {lastname: lastname}, {grade: grade}]}).toArray();
        
        res.render("result", { result });
    } catch (error) {
        // console.error("Error searching for student:", error);
        const errorMessage = "Error searching for student";
        console.log(errorMessage);
        // res.status(500).send("Error searching for student");
        res.render("result", { errorMessage:`${errorMessage}` });
    }
    
})

/* Adding a student to the database */
app.post("/add", async (req, res) => {
    let { firstname, lastname, grade } = req.body;
    firstname = firstname.trim().toLowerCase();
    lastname = lastname.trim().toLowerCase();
    const student = {_id: nanoid(), firstname, lastname, grade };
    console.log(student);
    try {
        const database = client.db("all-students");
        const gradeBook = database.collection("gradebook");
        const result = await gradeBook.insertOne(student);
        res.send(
            `
                <!DOCTYPE html>
                <html>
                <head>
                <script>
                    alert('The student was added successfully!');
                    window.location.href = '/foradding'; 
                </script>
                </head>
                <body>
                </body>
                </html>
            `
        );
    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).send("Error adding student");
    }
});

/* Updating a student in the database */
app.post("/update", async (req, res) => {
    let { firstname, lastname, grade } = req.body;
    firstname = firstname.trim().toLowerCase();
    lastname = lastname.trim().toLowerCase();
    const student = {firstname, lastname, grade };
    
    try {
        const database = client.db("all-students");
        const gradeBook = database.collection("gradebook");
        const result = await gradeBook.findOne({$and: [{firstname: firstname}, {lastname: lastname}]});
        if (result) {
            const updateResult = await gradeBook.updateOne({$and: [{firstname: firstname}, {lastname: lastname}]}, {$set: student});
            res.render('updateCorrectly');
        } else {
            res.render('updateIncorrectly')
        }  
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).send("Error updating student");
    } 
});

/* Deleting a student from the database */
app.delete("/delete", async (req, res) => {
    let { firstname, lastname } = req.body;
    firstname = firstname.trim().toLowerCase();
    lastname = lastname.trim().toLowerCase();
    try {
        const database = client.db("all-students");
        const gradeBook = database.collection("gradebook");
        const result = await gradeBook.deleteOne({$and: [{firstname: firstname}, {lastname: lastname}]});
        console.log(result);
        res.redirect("/fordeleting");
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).send("Error deleting student");
    }
});
 

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});