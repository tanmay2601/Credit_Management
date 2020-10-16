var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var mongoose = require("mongoose");

app.use(express.static('views'));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended:true}));

mongoose.connect('mongodb+srv://tanmay:Tanmay@2601@tanmay-bank.yzukp.mongodb.net/Bank', {useNewUrlParser: true,
                                               useFindAndModify: false,
													  useUnifiedTopology: true})
													.then(()=> console.log('Connected to db'))
													.catch(error=> console.log(error.message));
mongoose.set('useCreateIndex', true);


// schema 

var bankSchema = new mongoose.Schema({
	name : String,
	email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email"
        },
        required: [true, "Email required"]
    },
	mobile_number: Number,
	current_balance: Number
});

var Bank = mongoose.model("Bank", bankSchema);

var TableSchema = new mongoose.Schema({
	senders_name : String,
	receivers_name : String,
	transferred_amount : Number,
	Date: String,
	time : String,
	status: String
});

var Table = mongoose.model("Table", TableSchema);



/*Bank.create(
	
	{name: "Gal Gadot",
	email: "galgadot_beauty@gmail.com",
	mobile_number: "9987983452",
	current_balance: "15000"},
	
	
	function(err, bank){
		if(err)
			{
				console.log(err);
			}
		else{
			console.log(bank);
		}
	});
*/


app.get("/",function(req,res){
	res.render("homepage");
});
var message = "";
app.get("/customers",function(req,res){
	//get all customers from database
	message = message + "";
	Bank.find({},function(err,customer){
		if(err)
			{
				console.log(err);
			}
		else{
			res.render("customers",{customer:customer,success:message});
		}
	});
	
});

/*app.get("/home/customers/transaction_table/:senders_id/:senders_amount/:id/:current_balance",function(req,res){
	// viewing transaction table 
	
})*/

app.get("/customers/transaction_table",function(req,res){
	
	Table.find({},function(err,customer){
		res.render("transaction_table.ejs",{customer:customer});
	})
});

app.get("/customers/transfer_amount/:senders_id/:senders_amount/:id/:current_balance",function(req,res){

	//view selected customer and its info along with amount to be entered

	
	Bank.findById(req.params.id , function(err, customer){
		if(err)
			{
				console.log(err);
			}
		else{
			res.render("amount.ejs",{customer:customer,senders_id:req.params.senders_id,senders_amount:req.params.senders_amount});
		}
	})
});

app.post("/customers/transfer_amount/:senders_id/:senders_amount/:id/:current_balance",function(req,res){
	if (Number(req.params.senders_amount) >= Number(req.body.transfer_amount) && Number(req.body.transfer_amount) > 0 )
	{
		message = "Money Transferred Successfully !!!";
		var receiver_balance = Number(req.body.transfer_amount) + Number(req.params.current_balance);
		var senders_balance = Number(req.params.senders_amount) - Number(req.body.transfer_amount);
		console.log(receiver_balance);
		console.log(senders_balance);
			var date = new Date(); 
			var hours = date.getHours() + 5; 
			var minutes = date.getMinutes() + 30; 
			// Check whether AM or PM 
			var newformat = hours >= 12 ? 'PM' : 'AM';  
			
			// Find current hour in AM-PM Format 
			hours = hours % 12;  
			if(minutes>=60)
			{
				hours = hours+1;
			}
			minutes = minutes % 60;
			// To display "0" as "12" 
			hours = hours ? hours : 12;  
			minutes = minutes < 10 ? '0' + minutes : minutes; 
			
			var time =  hours + ':' + minutes + ' ' + newformat;
			

			var dd = date.getDate();
			var mm = date.getMonth()+1; 
			var yyyy = date.getFullYear();
			if(dd<10) 
			{
				dd='0'+dd;
			} 

			if(mm<10) 
			{
				mm='0'+mm;
			} 
			var today = dd+'-'+mm+'-'+yyyy;
			var status = "Success"
		Bank.findByIdAndUpdate(req.params.senders_id, {current_balance:senders_balance},function(err,found){
			
			if(err)
			{  
				console.log(err);
			}
			else{
				//console.log(today);
				Table.create({
					senders_name: found.name,
					transferred_amount: req.body.transfer_amount,
					time: time,
					Date: today,
					status: status
			},function(err,table){
				if(err)
				{
					console.log(err);
				}
				else{
					console.log(table);
				}
			})
				/*res.redirect("/home/customers/transaction_table/:senders_id/:senders_amount/:id/:current_balance");*/
			}
		});
		Bank.findByIdAndUpdate(req.params.id, {current_balance:receiver_balance},function(err,found){
			if(err)
			{  
				console.log(err);
			}
			else{
				
				Table.create({
					receivers_name: found.name
			},function(err,table){
				if(err)
				{
					console.log(err);
				}
				else{
					console.log(table);
					message = "Money Transferred Successfully !!!";
					res.redirect("/customers");
				}
			})
			}
		});
	}
	else if (Number(req.params.senders_amount) < Number(req.body.transfer_amount)){

		message = "Oops !! Insufficient Balance!"
		var receiver_balance = Number(req.params.current_balance);
		var senders_balance = Number(req.params.senders_amount);
		console.log(receiver_balance);
		console.log(senders_balance);
		var date = new Date(); 
		var hours = date.getHours() + 5; 
		var minutes = date.getMinutes() + 30; 
		// Check whether AM or PM 
		var newformat = hours >= 12 ? 'PM' : 'AM';  
		
		// Find current hour in AM-PM Format 
		hours = hours % 12;  
		if(minutes>=60)
		{
			hours = hours+1;
		}
		minutes = minutes % 60;
		// To display "0" as "12" 
		hours = hours ? hours : 12;  
		minutes = minutes < 10 ? '0' + minutes : minutes; 
		
		var time =  hours + ':' + minutes + ' ' + newformat;

			var dd = date.getDate();
			var mm = date.getMonth()+1; 
			var yyyy = date.getFullYear();
			if(dd<10) 
			{
				dd='0'+dd;
			} 

			if(mm<10) 
			{
				mm='0'+mm;
			} 
			var today = dd+'-'+mm+'-'+yyyy;
			var status = "Failed";
		Bank.findByIdAndUpdate(req.params.senders_id, {current_balance:senders_balance},function(err,found){
			
			if(err)
			{  
				console.log(err);
			}
			else{
				//console.log(today);
				Table.create({
					senders_name: found.name,
					transferred_amount: null,
					time: time,
					Date: today,
					status: status
			},function(err,table){
				if(err)
				{
					console.log(err);
				}
				else{
					console.log(table);
				}
			})
				/*res.redirect("/home/customers/transaction_table/:senders_id/:senders_amount/:id/:current_balance");*/
			}
		});
		Bank.findByIdAndUpdate(req.params.id, {current_balance:receiver_balance},function(err,found){
			if(err)
			{  
				console.log(err);
			}
			else{
				
				Table.create({
					receivers_name: found.name
			},function(err,table){
				if(err)
				{
					console.log(err);
				}
				else{
					message = "Oops !! Insufficient Balance!"
					console.log(table);
					res.redirect("/customers");
				}
			})
			}
		});
	}

	else if (Number(req.body.transfer_amount) <= 0 ){
		message = "Please enter a valid value greater than zero !!";
		var receiver_balance = Number(req.params.current_balance);
		var senders_balance = Number(req.params.senders_amount);
		console.log(receiver_balance);
		console.log(senders_balance);
		var date = new Date(); 
		var hours = date.getHours() + 5; 
		var minutes = date.getMinutes() + 30; 
		// Check whether AM or PM 
		var newformat = hours >= 12 ? 'PM' : 'AM';  
		
		// Find current hour in AM-PM Format 
		hours = hours % 12;  
		if(minutes>=60)
		{
			hours = hours+1;
		}
		minutes = minutes % 60;
		// To display "0" as "12" 
		hours = hours ? hours : 12;  
		minutes = minutes < 10 ? '0' + minutes : minutes; 
		
		var time =  hours + ':' + minutes + ' ' + newformat;

			var dd = date.getDate();
			var mm = date.getMonth()+1; 
			var yyyy = date.getFullYear();
			if(dd<10) 
			{
				dd='0'+dd;
			} 

			if(mm<10) 
			{
				mm='0'+mm;
			} 
			var today = dd+'-'+mm+'-'+yyyy;
			var status = "Failed";
		Bank.findByIdAndUpdate(req.params.senders_id, {current_balance:senders_balance},function(err,found){
			
			if(err)
			{  
				console.log(err);
			}
			else{
				//console.log(today);
				Table.create({
					senders_name: found.name,
					transferred_amount: null,
					time: time,
					Date: today,
					status: status
			},function(err,table){
				if(err)
				{
					console.log(err);
				}
				else{
					console.log(table);
				}
			})
				
			}
		});
		Bank.findByIdAndUpdate(req.params.id, {current_balance:receiver_balance},function(err,found){
			if(err)
			{  
				console.log(err);
			}
			else{
				
				Table.create({
					receivers_name: found.name
			},function(err,table){
				if(err)
				{
					console.log(err);
				}
				else{
					console.log(table);
					message = "Please enter a valid value greater than zero !!";
					res.redirect("/customers");
				}
			})
			}
		});

	}

});

app.get("/customers/:id/:senders_amount/:email",function(req,res){
	// show list of customers except one which clicked
	
	Bank.find( {email:{$ne:req.params.email}},function(err,customer){
		if(err)
			{
				console.log(err);
			}
		else{
			res.render("transfer_money.ejs",{customer:customer,senders_id:req.params.id,senders_amount:req.params.senders_amount});
		}
	})
});


app.get("/customers/:id",function(req,res){
	// view single customer
	Bank.findById(req.params.id , function(err, customer){
		if(err)
			{
				console.log(err);
			}
		else{
			res.render("customer_info.ejs",{customer:customer});
		}
	})
});


app.listen(process.env.PORT || 3000,function(){
	console.log("Server has started");
});

