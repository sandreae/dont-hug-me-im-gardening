# Don't Hug Me I'm Gardening!

## Run

### Tauri

Using the tauri framework we can bundle an `aquadoggo` node together with the web frontend. To launch the app you simply run:

`npm run tauri dev`

### Browser

If you have a local or remote `aquadoggo` node running then you can simply serve the app as a static
site and make all requests to the existing node (If you don't already ). 

If you're node isn't accessible from the default location (`http://0.0.0.0:2020`) then please
change `NODE_ADDRESS` to the correct value.

Before running the app for the first time, the node must be informed of any required schema. To do this, deploy the
schema from the `schema.lock` file (you only need to do this one time):

`npm run deploy`

Then you can serve the apps static assets and visit it in the browser at `localhost:8080`

`npx http-server ./src`

This will deploy the relevant schema to your

## Next Steps

- [] set/get `NODE_ADDRESS` from env vars
- [] navigate to specific garden using id in url path
- [] refresh button which fetches new items on garden and sprites list
- [] text search for sprites list
- [] explore layering (maybe just two layers) sprites
- [] implement "private" gardens (requires schema changes)
- [] update interface for sprites and gardens
- [] deletion of sprites
- [] use tauri commands to implement uploading seed data from client
