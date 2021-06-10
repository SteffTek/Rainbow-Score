/*
    Imports
*/
const cliProgress = require('cli-progress');
const mongoose = require('mongoose');
const config = require("./config").getConfig();

/*
    Load Mongo DB
*/
mongoose.connect(config.db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (err) {
    if (err) throw err;
    console.log("Connected to database!")
});

const pixelSchema = mongoose.Schema({
    timestamp: Number,
    userID: String,
    color: Number,
    x: Number,
    y: Number
});
const pixel = mongoose.model('Pixel', pixelSchema);

const userSchema = mongoose.Schema({
    id: String,
    username: String,
    avatar: String,
    discriminator: String,
    public_flags: Number,
    flags: Number,
    locale: String,
    mfa_enabled: Boolean,
    premium_type: Number,
    session: String,
    lastPixel: Number,
});

const user = mongoose.model('User', userSchema);

/*
    Get Users
*/
user.find().then(async users => {

    /*
        Store Highscore
    */
    var highscore = []

    /*
        Progress Bar
    */
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(users.length, 0);

    /*
        Count for user
    */
    for(let user in users) {
        user = users[user];

        // COUNT DOCUMENTS
        let count = await pixel.countDocuments({userID: user.id});
        highscore.push({
            id: user.id,
            name: user.username + "#" + user.discriminator,
            count: count
        })

        // INCREMENT BAR
        bar.increment();
    }

    /*
        Stop Progress
    */
    bar.stop();

    /* Sort */
    highscore = highscore.sort(compare);

    for(let i = 0; i < 10; i++) {
        console.log(highscore[i]);
    }
});

function compare( a, b ) {
    if ( a.count > b.count ){
      return -1;
    }
    if ( a.count < b.count ){
      return 1;
    }
    return 0;
}