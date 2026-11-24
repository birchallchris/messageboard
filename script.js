import { createClient } from
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase = createClient(
    'https://nslmlgpkfohlutdkceyc.supabase.co',
    'sb_publishable_ANfU5GJZZGhU9Jf2H3kXug_giOU7zAW'
)
async function loadMessages() {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
    if (error) {
        console.error(error)
        return
    }
    const container = document.getElementById('messages');
    container.innerHTML = '';
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'message';
        const title = document.createElement('h3');
        title.textContent = item.title;
        const message = document.createElement('p');
        message.textContent = item.message;
        const author = document.createElement('small');
        author.textContent = 'Posted by ' + item.author;
        div.append(title, message, author);
        container.appendChild(div);
    });
}
loadMessages();


const form = document.getElementById('messageForm');
form.addEventListener('submit', async function(event) {

    event.preventDefault();

    // code to get the details of the logged in user (if there is one)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        alert('Please log in before submitting a message');
        return;
    }
    
    const title = document.getElementById('title').value;
    const message = document.getElementById('message').value;
    const author = document.getElementById('author').value;
    const { data, error } = await supabase
        .from('messages')
        .insert([
            {
                title: title,
                message: message,
                author: user.email,
                user_id: user.id
            }
        ]);
    if (error) {
        alert('Something went wrong!');
        console.error(error);
    } else {
        alert('Your message has been submitted!');
        form.reset();
        loadMessages();
    }
});

document.getElementById('registerButton')
.addEventListener('click', async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });
    if (error) {
        alert(error.message);
    } else {
        alert('Registration successful!');
    }
});

document.getElementById('loginButton')
.addEventListener('click', async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    if (error) {
        alert(error.message);
    } else {
        alert('You are now logged in!');
        updateAuthStatus();
    }
});

document.getElementById('logoutButton')
.addEventListener('click', async function() {
    await supabase.auth.signOut();
    updateAuthStatus();
});

async function updateAuthStatus() {
    const { data } = await supabase.auth.getUser();
    const loggedIn = !!data.user;
    document.getElementById('authStatus').textContent =
        loggedIn ? 'Logged in as ' + data.user.email : 'Not logged in';
    document.getElementById('loginButton').hidden = loggedIn;
    document.getElementById('registerButton').hidden = loggedIn;
    document.getElementById('logoutButton').hidden = !loggedIn;
    document.getElementById('messageForm').hidden = !loggedIn;
}
updateAuthStatus();
