import { useEffect, useRef, useState } from 'react';
import { calculate, fetchRegions, fetchCountries } from '../lib/api.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, Form, Select, InputNumber, Checkbox, Button, Row, Col, Tooltip, Typography, Space, Statistic, Divider, Skeleton } from 'antd';

export default function Calculator() {
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [level, setLevel] = useState('L1');
  const [serviceType, setServiceType] = useState('Full Day Visit (8hrs)');
  const [distance, setDistance] = useState(0);
  const [outOfHours, setOutOfHours] = useState(false);
  const [weekend, setWeekend] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regions, setRegions] = useState([]);
  const [countries, setCountries] = useState([]);
  const quoteRef = useRef(null);

  const fmt = (n) =>
    typeof n === 'number' ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n) : n;

  useEffect(() => {
    fetchRegions().then((r) => setRegions(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setCountry('');
    if (region) fetchCountries(region).then((r) => setCountries(r.data || [])).catch(() => setCountries([]));
  }, [region]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await calculate({ country, level, service_type: serviceType, distance: Number(distance), out_of_hours: outOfHours, weekend });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!result) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header
    try {
      const resp = await fetch('/logo.jpeg');
      const blob = await resp.blob();
      const reader = new FileReader();
      const logoData = await new Promise((res) => {
        reader.onload = () => res(reader.result);
        reader.readAsDataURL(blob);
      });
      pdf.addImage(logoData, 'JPEG', 14, 12, 28, 12);
    } catch {}

    pdf.setTextColor('#103B6F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('Price Book Quote', pageWidth / 2, 20, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setTextColor('#0F2748');
    const issued = new Date().toLocaleString();
    pdf.text(`Issued: ${issued}`, pageWidth - 14, 28, { align: 'right' });

    // Client/Selection
    pdf.setDrawColor('#E6EEF5');
    pdf.setFillColor('#F7FAFC');
    pdf.roundedRect(14, 34, pageWidth - 28, 28, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.text('Selection', 18, 42);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Region: ${region || '-'}`, 18, 49);
    pdf.text(`Country: ${country || '-'}`, 18, 55);
    pdf.text(`Level: ${level}`, 90, 49);
    pdf.text(`Service: ${serviceType}`, 90, 55);

    // Financials
    const startY = 70;
    const rowH = 9;
    const rows = [
      ['Base Price', fmt(result.base_price)],
      ['Travel Fee', fmt(result.travel_fee)],
      [
        'Multipliers',
        `OOH: ${result.multipliers_applied?.out_of_hours ? 'Yes' : 'No'}  Weekend: ${result.multipliers_applied?.weekend ? 'Yes' : 'No'}  x${result.multipliers_applied?.multiplier}`,
      ],
      [
        `Service Management Fee (${result.service_management_fee_pct}%)`,
        fmt(result.service_management_fee),
      ],
    ];

    pdf.setFont('helvetica', 'bold');
    pdf.text('Quote Summary', 14, startY - 6);
    pdf.setFont('helvetica', 'normal');

    let y = startY;
    rows.forEach((r) => {
      pdf.setDrawColor('#E6EEF5');
      pdf.roundedRect(14, y - 6, pageWidth - 28, rowH, 2, 2);
      pdf.text(r[0], 18, y);
      pdf.text(String(r[1]), pageWidth - 18, y, { align: 'right' });
      y += rowH + 3;
    });

    // Total
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#12B5A6');
    pdf.setDrawColor('#12B5A6');
    pdf.roundedRect(14, y - 7, pageWidth - 28, rowH + 2, 2, 2);
    pdf.text('Total', 18, y);
    pdf.text(fmt(result.total), pageWidth - 18, y, { align: 'right' });

    // Footer info
    pdf.setTextColor('#0F2748');
    pdf.setFont('helvetica', 'normal');
    const footY = y + 14;
    pdf.text(`Currency: ${result.currency} | Payment Terms: ${result.payment_terms}`, 14, footY);
    pdf.text('Prepared by TECEZE • Generated from Price Book Calculator', 14, footY + 6);

    pdf.save('teceze-quote.pdf');
  };

  return (
    <Row gutter={[16, 16]} align="stretch" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Col xs={24} md={12}>
        <Card title="Calculate Quote" style={{ height: '100%' }}>
          <Form layout="vertical" onSubmitCapture={onSubmit}>
            <Form.Item label="Region">
              <Select placeholder="Select region" value={region} onChange={setRegion} options={regions.map(r => ({ value: r, label: r }))} />
            </Form.Item>
            <Form.Item label="Country">
              <Select placeholder="Select country" value={country} disabled={!region} onChange={setCountry} options={countries.map(c => ({ value: c, label: c }))} />
            </Form.Item>
            <Form.Item label={<Space>Experience Level<Tooltip title="L1: Basic troubleshooting; L5: Architecture & planning"><Typography.Link>info</Typography.Link></Tooltip></Space>}>
              <Select value={level} onChange={setLevel} options={["L1","L2","L3","L4","L5"].map(l=>({value:l,label:l}))} />
            </Form.Item>
            <Form.Item label="Service Type">
              <Select value={serviceType} onChange={setServiceType} options={["Full Day Visit (8hrs)","Half Day Visit (4hrs)","Dispatch Ticket"].map(s=>({value:s,label:s}))} />
            </Form.Item>
            <Form.Item label="Travel Distance (km)">
              <InputNumber min={0} style={{ width: '100%' }} value={distance} onChange={(v)=>setDistance(v||0)} />
            </Form.Item>
            <Form.Item>
              <Space direction="vertical">
                <Checkbox checked={outOfHours} onChange={(e)=>setOutOfHours(e.target.checked)}>Out-of-Hours (x1.5)</Checkbox>
                <Checkbox checked={weekend} onChange={(e)=>setWeekend(e.target.checked)}>Weekend/Holiday (x2)</Checkbox>
              </Space>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                {loading ? 'Calculating...' : 'Calculate Quote'}
              </Button>
            </Form.Item>
            {error && <Typography.Text type="danger">{error}</Typography.Text>}
          </Form>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <div ref={quoteRef}>
          <Card title="Quote" style={{ height: '100%' }}>
            {loading && (
              <div>
                <Skeleton active paragraph={{ rows: 6 }} />
              </div>
            )}
            {!loading && !result && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
                <Typography.Text type="secondary" style={{ textAlign: 'center' }}>Fill the form and calculate to see the quote.</Typography.Text>
              </div>
            )}
            {!loading && result && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text>Currency: <b>{result.currency}</b></Typography.Text>
                <Typography.Text>Payment Terms: <b>{result.payment_terms}</b></Typography.Text>
                <Row gutter={12}>
                  <Col span={12}><Card size="small" style={{ background: '#E8F7F5' }}><Statistic title="Base Price" value={result.base_price} /></Card></Col>
                  <Col span={12}><Card size="small" style={{ background: '#FFF6E5' }}><Statistic title="Travel Fee" value={result.travel_fee} /></Card></Col>
                </Row>
                <Card size="small" style={{ background: '#F3F6FF' }}>
                  <Typography.Text>Multipliers: Out-of-Hours: {String(result.multipliers_applied?.out_of_hours)}; Weekend: {String(result.multipliers_applied?.weekend)}; x{result.multipliers_applied?.multiplier}</Typography.Text>
                </Card>
                <Card size="small" style={{ background: '#FFF2E8' }}><Statistic title={`Service Management Fee (${result.service_management_fee_pct}%)`} value={result.service_management_fee} /></Card>
                <Divider style={{ margin: '8px 0' }} />
                <Card size="small" style={{ background: '#ECFDF5' }}><Statistic title="Total" value={result.total} precision={2} /></Card>
                <Button onClick={downloadPdf}>Download PDF</Button>
              </Space>
            )}
          </Card>
        </div>
      </Col>
    </Row>
  );
}


