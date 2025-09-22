import { Card, Typography, List } from 'antd';

export default function About() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Card title="About TECEZE Price Book Calculator">
        <Typography.Paragraph>
          This tool calculates a professional quote from TECEZE's global price book.
        </Typography.Paragraph>
        <List
          size="small"
          header={<b>How it works</b>}
          dataSource={[
            'Select Region and Country – pulls rates from the seeded price book.',
            'Pick Experience Level (L1–L5) and Service Type (Full Day, Half Day, Dispatch).',
            'Enter travel distance (km). First 50 km included; additional charged at 0.40 per km.',
            'Apply Out-of-hours (x1.5) and Weekend/Holiday (x2) multipliers if needed.',
            'Service Management Fee of 5% is added to the subtotal.',
          ]}
          renderItem={(item) => <List.Item><Typography.Text>{item}</Typography.Text></List.Item>}
        />
        <Typography.Paragraph style={{ marginTop: 12 }}>
          Terms are sourced from the price book: currency and payment terms display with each result.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}


