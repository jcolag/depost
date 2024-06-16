# De-Post

This script converts an archive export from now-defunct [Post.News](https://post.news) to a standalone, static archive for publication or casual reading.

## Usage

First, you'll need to set everything up, which means understanding what you have available.

### The Post.News Archive

When you received your Post.News archive, it came in three pieces.

* `posts-{user-id}.zip`, an archive of posts by that user.  Inside, it *probably* only includes `posts-1.json`.
* `images-{user-id}.zip`, an archive of images uploaded by that user for use in posts.
* `profile-{user-id}.json`, profile information for that user.

Why that format and not anything else?  They have provided no clues to help answer that question.

### Setting up

First, "clone" or otherwise download the contents of this repository.

Copy (or move) the profile into the repository's root.

Unzip (or otherwise unpack) the `posts-WHATEVER.zip` file, and move `posts-1.json` into the repository root, too.  If you have more than that single file, then you'll need to modify the script, since it only had one example to work with.

Unzip (or otherwise unpack) the `images-WHATEVER.zip` file, and move the resulting `images` folder into the repository root with everything else.

The root folder should now look something like this.

* `assets`, a folder.
* `images`, a folder, which you moved here.
* `depost.js`, the script that'll do the work.
* `posts-1.json`, the archive of your posts, which you moved here.
* `profile-YOUR.ID.json`, the archive of your Post.News profile.
* `README.md`, these instructions.

Again, if you have more than that, you *might* need to do additional work.

You will also need a recent version of [Node.js](https://nodejs.org/) installed where you can run it.  The script doesn't use any libraries, though, so you don't need to worry about that traditional step.

### Creating the Website

You'll need to run the following command from the repository's root.

```console
node depost.js posts-1.json profile-YOUR.ID.json output-folder
```

As a result of running it, you should see a folder called `output-folder` (or whatever you called it), which should contain your final archive.  It contains...

* `index.html`, an chronological index of your posts, assuming that `posts-1.json` didn't somehow list them out of order.
* Each post as a separate page, named after its ID, linking to your local images (when using any) instead of Post.News's CDN.  Each page also includes an adaptation of your profile information at the bottom of the post, helping people credit and find you.
* "Topic" pages, named `topic-{name}.html`, where some aspect of Post.News categorized a post.
* The `assets` folder, containing CSS and JavaScript to make the site work.
* Your `images` folder, for posts to reference.

You can then upload that `output-folder` wherever you please, and have a permanent archive of your posts.

If you want to use [unrot∙link](https://unrot.link/), you'll need to ask the maintainer(s) to add your site to the allow list as a [GitHub issue](https://unrot.link/access/).

## Known Problems

In addition to only having one example export to work with, making the process potentially unreliable, some other flaws exist, with varying degrees of effort involved in fixing them.

Most prominently, Post.News appears to have chosen to redirect all internal links to `https://post-sandbox.news/`, which exists, but doesn't appear to host any of the content directed there.  Even if it did, Post.News has shut down, so the content *wouldn't* exist there anyway, soon enough.  Fixing this would probably require some kind of manual intervention, ranging from manually editing the URLs at some stage to building some pseudo-federated system like [Tweetback](https://github.com/tweetback/tweetback-canonical) uses for Twitter archives.  Regardless, internal links go nowhere, until somebody finds a way to fix that, if a fix exists at all.  Leaving the broken links seemed more honest than removing anything from a post.

Emoji reactions also need some work, currently only supporting `:thumbs_up:`.  If you want to add more, because your archive requires them, then you can add them to the `emoji` object near the top of `depost.js`, and it should work automatically from there.  If somebody were to know the entire list of emoji reactions supported by Post.News, that would help a lot.

Post.News's editor had some...*interesting* flaws of its own, especially when typing hashtags/topics.  It appears that, if the user tried to *edit* a hashtag after starting to type it, then Post.News somehow added all versions of the topic to the post as links.  None of those links go anywhere, because of the first issue, but it still looks odd to see something like "[#S](.)[#Soc](.)[#SocialMedia](.)" in a post.  Note that this does *not* affect the topic pages referred to above, because `depost.js` generates those from each post's topic list.  It only affects the hashtags that you typed (and retyped) into your posts.
