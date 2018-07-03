GET / 
=> some homepage text

POST api/register
keys{
    email
    password
}
=>adding a new user to db

POST api/authenticate
keys{
    email
    password
}
=> json{
    success: 
    accessToken:
    refreshToken:
}

POST api/token
keys{
    email
    refreshToken
}
=> json{
    succes:
    newAccessToken:
}

GET api/profile
header = Authorization: accessToken
=> user._id



