const express = require("express");
const app = express();
const date = require(__dirname+'/date.js');
const mongoose = require('mongoose')


let items =["Buy Food","Cook Food","Eat Food"];
let workitems =[];

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
// connect mongoose
mongoose.connect("mongodb+srv://admin-ulhas:ulhas123@cluster0.nucbo.mongodb.net/todolistDB");

const itemsSchema = {
    name:String
};

const Item = mongoose.model('item',itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist"
});
const item2 = new Item({
    name: "Hit the + button to add new item"
});
const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema ={
    name:String,
    items :[itemsSchema]
};  

const List = mongoose.model("list",listSchema)


app.get("/", (req, res)=> {
  

    Item.find({},(err,foundItems)=>{
        if(foundItems.length===0){
            Item.insertMany(defaultItems,(err)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("succesfully made changes to database");
                }
            })
            res.redirect('/')
        }else{
            res.render("list", { listTitle: "Today",newlistitems: foundItems});
        }
       
    })
    
});


app.get("/:customListName",(req,res)=>{
    const customListName = req.params.customListName;

    List.findOne({name: customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name : customListName,
                    items : defaultItems
                })
                list.save();
                res.redirect('/'+ customListName)
            }else{
                res.render("list", { listTitle:foundList.name ,newlistitems: foundList.items});
            }
        }
    })
    


     
})


app.get('/about',(req,res)=>{
    res.render("about")
})

app.post('/',(req,res)=>{

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name : itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/")

    }else{
        List.findOne({name: listName}, function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName)
        })
    }

})

app.post("/delete",(req,res)=>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName=== "Today"){
        Item.findByIdAndDelete(checkedItemId,(err)=>{
            if(!err){
                console.log("successfully deleted item");
                res.redirect('/')
            }
            
        })
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}},(err,foundList)=>{
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }
    
})

app.post('/work',(req,res)=>{
    res.render("list",{listTitle:"Work List",newlistitems:workitems})
    
})
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("server has started successfully");
});
