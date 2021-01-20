This tool generates a static site listing the scripts in this repository. Run it with:

```bash
go run .
```

It will create a folder called "build" which can be uploaded to a web server.

You can view the contents of the folder locally with:

```bash
cd build
python -m SimpleHTTPServer 8080
```

Then open http://localhost:8080 in your browser
