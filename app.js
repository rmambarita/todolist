const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

run();
async function run() {
  try {
    mongoose.connect("mongodb+srv://rmambarita:Enchantedswifty13@cluster0.mjp8ulv.mongodb.net/todolistDB");

    const itemsSchema = new mongoose.Schema({
      name: String,
    });

    const Item = mongoose.model("Item", itemsSchema);

    var item1 = new Item({
      name: "Welcome to your todolist!",
    });
    var item2 = new Item({
      name: "Hit the + button to add new item.",
    });
    var item3 = new Item({
      name: "<-- Hit this to delete an item.",
    });

    var defaultItems = [item1, item2, item3];

    const listSchema = {
      name: String,
      items: [itemsSchema]
    };

    const List = mongoose.model("List", listSchema);

    // mongoose.connection.close();

    app.get("/", async function (req, res) {
      const foundItems = await Item.find({});

      if (!(await Item.exists())) {
        await Item.insertMany(defaultItems);
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    });

    app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName})
      .then(function(foundList){

            if(!foundList){
              const list = new List({
                name: customListName,
                items: defaultItems
              });

              list.save();
              console.log("saved");
              res.redirect("/" + customListName);
            }
            else{
              res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
      })
      .catch(function(err){});
    });

    app.post("/", function (req, res) {

      const itemName = req.body.newItem;
      const listName = req.body.list;

      const item = new Item ({
        name: itemName
      });

      if(listName === "Today") {
        item.save();
        res.redirect("/");
      } else {
        List.findOne({name: listName}).then(function(foundList) {
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
        })
      }
    });


    app.post("/delete", function(req, res){

    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    console.log("checkedItemID: "+checkedItemID)

    if(listName === "Today") {
        Item.findByIdAndRemove({_id: checkedItemID}).then(function(foundList){
            if(err){
                console.log(err);
            }else{
                console.log("Work done successfully!");
                res.redirect("/");
            }
        });
    } else {
        List.findOne({name: listName}).then(function(foundList){
            foundList.items.pull({ _id: checkedItemID });
            foundList.save();

            res.redirect("/" + listName);
            });
          }
    });


    app.get("/work", function (req, res) {
      res.render("list", { listTitle: "Work List", newListItems: workItems });
    });

    app.get("/about", function (req, res) {
      res.render("about");
    });

    let port = process.env.PORT;
    if (port == null || port == "") {
        port = 3000;
    }


    app.listen(port, function () {
      console.log("Server has started successfully.");
    });
  } catch (e) {
    console.log(e.message);
  }
}
