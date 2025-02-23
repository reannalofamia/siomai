// const btn = document.getElementById('menu-btn')
// const nav = document.getElementById('menu')

// function navToggle() {
//   btn.classList.toggle('open')
//   nav.classList.toggle('hidden')
//   document.body.classList.toggle('no-scroll')
// }

// btn.addEventListener('click', navToggle)

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qfjdoxjxlidcrryrfbri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmamRveGp4bGlkY3JyeXJmYnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMTY0NjEsImV4cCI6MjA1NTg5MjQ2MX0.-iX-kYRdvjF30TdWU4sqKb9ZpjtwcrEeKRdqlJmyt84';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const productList = document.getElementById('product-list');
const cartItemsList = document.getElementById('cart-items');
const placeOrderBtn = document.getElementById('place-order-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const authStatus = document.getElementById('auth-status');
const orderStatusDiv = document.getElementById('order-status');

let cart = [];
let user = null;

async function loadProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
        console.error('Error loading products:', error);
        return;
    }
    productList.innerHTML = data.map(product => `
        <div class="product">
            <h3>${product.name}</h3>
            <p>Price: $${product.price}</p>
            <button onclick="addToCart(${JSON.stringify(product)})">Add to Cart</button>
        </div>
    `).join('');
}

function addToCart(product) {
    cart.push(product);
    renderCart();
}

function renderCart() {
    cartItemsList.innerHTML = cart.map(item => `<li>${item.name} - $${item.price}</li>`).join('');
}

async function placeOrder() {
    if (!user) {
        alert("Please login first.");
        return;
    }
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{ user_id: user.id, status: 'pending', order_date: new Date() }])
        .select()
        .single();
    if (orderError){
        console.log(orderError);
        return;
    }
    const orderId = order.id;

    for (const item of cart) {
        await supabase.from('order_items').insert([{ order_id: orderId, product_id: item.id, quantity: 1 }]);
    }

    cart = [];
    renderCart();
    orderStatusDiv.innerHTML = "<p>Order placed successfully!</p>";
}

async function checkAuth() {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    user = currentUser;
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

async function handleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    if(error){
        console.log(error);
    }
}

async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if(error){
        console.log(error);
    }
}

loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
placeOrderBtn.addEventListener('click', placeOrder);

checkAuth();
loadProducts();