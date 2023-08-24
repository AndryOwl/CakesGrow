const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ingredients = require('./ingredients.json');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Sample JSON data for dishes
let jsonData = require('./database.json');



app.get('/', (req, res) => {
  res.render('index', { jsonData });
});

app.get('/add', (req, res) => {
  res.render('add');
});

let highestId = jsonData.reduce((maxId, component) => Math.max(maxId, component.id), 0);

app.post('/add', (req, res) => {
  const newComponent = {
    id: ++highestId,
    name: req.body.name,
    // Add more fields as needed
  };

  jsonData.push(newComponent);

  fs.writeFile('./database.json', JSON.stringify(jsonData), err => {
    if (err) {
      console.error('Error writing to database.json:', err);
    } else {
      console.log('Data written to database.json');
    }
  });

  res.redirect('/');
});

app.get('/products', (req, res) => {
  // Read the products from products.json
  fs.readFile('./products.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products.json:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const products = JSON.parse(data);
    res.render('products', { products });
  });
});


// Route to add ingredients
app.get('/ingredients/:dishId', (req, res) => {
  const dishId = req.params.dishId;

  // Find the dish name based on the dishId
  const dish = jsonData.find(dish => dish.id === dishId);

  if (!dish) {
    console.error('Dish not found:', dishId);
    res.status(404).json({ error: 'Dish not found' });
    return;
  }

  // Read the ingredients from ingredients.json
  fs.readFile('./ingredients.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading ingredients.json:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const ingredients = JSON.parse(data);
    const filteredIngredients = ingredients.filter(ingredient => ingredient.dishId === dishId);

    // Render the ingredients.ejs template and pass the required data
    res.render('ingredients', {
      dishName: dish.name,
      ingredients: filteredIngredients
    });
  });
});




app.post('/add-ingredient', (req, res) => {
  const productName = req.body.productName;
  const ingredientType = req.body.ingredientType;
  const amount = parseFloat(req.body.amount);

  // Read the products from products.json
  fs.readFile('./products.json', 'utf8', (err, productData) => {
    if (err) {
      console.error('Error reading products.json:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const products = JSON.parse(productData);
    const product = products.find(product => product.name === productName);

    if (!product) {
      console.error('Product not found:', productName);
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Calculate ingredient cost based on type
    let ingredientCost;
    if (ingredientType === 'Штук/и') {
      ingredientCost = product.cost * amount;
    } else if (ingredientType === 'Грамм' || ingredientType === 'Миллилитров') {
      ingredientCost = (amount / product.amount) * product.cost;
    } else {
      console.error('Invalid ingredient type:', ingredientType);
      res.status(400).json({ error: 'Invalid ingredient type' });
      return;
    }

    const newIngredient = {
      product: productName,
      amount: amount,
      dishId: req.body.dishId,
      cost: ingredientCost
    };

    // Update ingredients.json and perform necessary error handling
    // ...

    res.redirect('/ingredients/' + req.body.dishId);
  });
});


// Function to find dishId by dishName in dishes.json
function findDishIdByName(dishName) {
  const dish = jsonData.find(dish => dish.name === dishName);
  return dish ? dish.id : null;
}


app.get('/ingredients/:dishId', (req, res) => {
  const dishId = req.params.dishId;
  // Read the ingredients from ingredients.json
  fs.readFile('./ingredients.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading ingredients.json:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const ingredients = JSON.parse(data);
    const filteredIngredients = ingredients.filter(ingredient => ingredient.dishId === dishId);

    res.json(filteredIngredients);
  });
});

app.get('/add-product', (req, res) => {
  res.render('add-product');
});

app.post('/add-product', (req, res) => {
  const { name, cost, amount, type } = req.body;
  // Read existing products
  fs.readFile('./products.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products.json:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const products = JSON.parse(data);
    const newProduct = { name, cost: parseFloat(cost), amount: parseFloat(amount), type };
    products.push(newProduct);

    // Write updated products back to products.json
    fs.writeFile('./products.json', JSON.stringify(products), err => {
      if (err) {
        console.error('Error writing to products.json:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      console.log('New product added:', newProduct);
      res.redirect('/products');
    });
  });
});

app.get('/products', (req, res) => {
  // Read the products from products.json
  fs.readFile('./products.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products.json:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const jsonData = JSON.parse(data);

    res.render('products', { jsonData }); // Pass jsonData to the template
  });
});

app.get('/update-product-details', (req, res) => {
  // Read products from products.json
  fs.readFile('./products.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products.json:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const products = JSON.parse(data);

    // Render the update-product-details.ejs view and pass the products data
    res.render('update-product-details', { products });
  });
});



app.post('/update-product', (req, res) => {
  const { productName, newPrice, newAmount } = req.body;

  // Read the products from products.json
  fs.readFile('./products.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products.json:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const products = JSON.parse(data);
    const productToUpdate = products.find(product => product.name === productName);

    if (productToUpdate) {
      productToUpdate.cost = newPrice;
      productToUpdate.amount = newAmount;

      // Write the updated products back to products.json
      fs.writeFile('./products.json', JSON.stringify(products, null, 2), err => {
        if (err) {
          console.error('Error writing to products.json:', err);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          res.json({ message: 'Product details updated successfully' });
        }
      });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
