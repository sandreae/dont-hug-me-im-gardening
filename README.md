# Don't Hug Me I'm Gardening!

A p2p sprite creating garden building tile game! Create tile packs, share them with your friends,
build gardens, _share them with your friends!!_

There are lots of interesting p2p shenanegans going on in the background (you can read about them
below), but primarily this is a game, where (see above) you can create sprites and build gardens.

Powered by p2panda.

## Install

Go to the [releases](https://github.com/sandreae/dont-hug-me-im-gardening/releases) page and
download the latest binary/package compiled for your system. 

On a Linux machine there are two options:

### `.deb`

```bash
# download the latest deb file from the releases page 
wget https://github.com/sandreae/dont-hug-me-im-gardening/releases/download/<VERSION>/dont-hug-me-im-gardening_<VERSION>_amd64.deb

# install using `apt`
sudo apt install <VERSION>/dont-hug-me-im-gardening_<VERSION>_amd64.deb

# now you can run `dont-hug-me-im-gardening` from the command line like so
dont-hug-me-im-gardening

```

### `AppImage`

```bash
# download the latest AppImage from the releases page 
wget https://github.com/sandreae/dont-hug-me-im-gardening/releases/download/<VERSION>/dont-hug-me-im-gardening_<VERSION>_amd64.AppImage

# set executable permission
chmod +x dont-hug-me-im-gardening_<VERSION>_amd64.AppImage

# run the AppImage
./dont-hug-me-im-gardening_<VERSION>_amd64.AppImage
```

I'll update with instructions for other platforms once I've been able to test them myself. If
anyone does this before me, I'd be very happy to hear from you.

## Run

Whichever installation method you use, behavior when running the app is the same. In the
instructions below I assume `.deb` installation was performed, if you followed a different method
please adjust the commands accordingly.

### Quick start

All you need to do is launch the app, no configuration required:
```
dont-hug-me-im-gardening
```

This will launch the app and you can get started creating your sprite packs and building your
gardens! 

As the app doesn't come pre-packaged with any sprite pack, on a first time launch things look a
little sad, no sprites, no gardens, nothing... all very empty. Follow the next steps to change this!

### Deploy existing sprite pack

In order to get garden building, you need sprite packs to use. You can create them yourself by
uploading images and gifs yourself. To get you up and running quickly, and offer some inspiration,
I'll provide some starter pack. The first is by Mio Ebisu and you can load them in with the
following commands:

```
wget https://github.com/sandreae/dont-hug-me-im-gardening-sprite-sets/path_to_sprite_set.toml

dont-hug-me-im-scared --load-sprite-pack ./path_to_sprite_set.toml
```

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

## TODOs
- [] change logo
- [] remove all cli options except `--load-sprite-pack`
- [] configure node via config file
- [] graceful cli errors
- [] fix cli help

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
