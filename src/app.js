const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const path         = require('path');
const routes       = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, filePath) => {
    // iOS AVPlayer requires audio/mp4 for .m4a (AAC-in-MPEG4) files.
    // express.static resolves .m4a to audio/x-m4a which iOS rejects.
    if (filePath.endsWith('.m4a')) {
      res.setHeader('Content-Type', 'audio/mp4');
    }
  },
}));

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
