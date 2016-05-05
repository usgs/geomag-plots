geomag-plots
============

Plots of timeseries data for geomagnetic observatories.


Getting Started
---------------

- make sure `node`, `npm`, `grunt-cli`, and `php-cgi` are installed.
- clone/download repository
- from project directory:
  - run `npm install` to install development dependencies
  - run `src/lib/pre-install` (or, on windows, `php src/lib/pre-install.php`) to configure the application
  - run `grunt` to start a local server to preview the application


Related Projects
----------------
This application displays data from the `geomag-edge-ws` timeseries web service,
which is maintained as a separate project on github:
  https://github.com/usgs/geomag-edge-ws
