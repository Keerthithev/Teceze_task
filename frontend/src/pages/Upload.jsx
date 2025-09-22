import { useState } from 'react';
import { uploadCsv } from '../lib/api.js';
import { Upload as AntUpload, message, Card, Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setStatus('Uploading...');
    try {
      const res = await uploadCsv(file);
      setStatus(`Imported ${res.data.count} rows`);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Upload failed');
    }
  };

  const { Dragger } = AntUpload;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Card title="Upload Price Book CSV">
        <Dragger
          name="file"
          multiple={false}
          accept=".csv"
          beforeUpload={() => false}
          onChange={(info) => {
            const f = info.fileList?.[0]?.originFileObj;
            setFile(f || null);
          }}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">Click or drag CSV to this area to upload</p>
        </Dragger>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <Button type="primary" onClick={onSubmit} disabled={!file}>Upload</Button>
          {status && <span>{status}</span>}
        </div>
      </Card>
    </div>
  );
}


