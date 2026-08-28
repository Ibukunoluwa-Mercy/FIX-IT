import React from 'react';
import { Row, Col, Card, Dropdown } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FileText, ClipboardCheck, Wrench, CheckCircle, Users, ArrowRight } from 'lucide-react';

const severityData = [
  { name: 'High', value: 38, percent: '29%', color: '#ef4444' },
  { name: 'Medium', value: 45, percent: '34%', color: '#f97316' },
  { name: 'Low', value: 29, percent: '22%', color: '#eab308' },
  { name: 'In Progress', value: 24, percent: '18%', color: '#3b82f6' },
  { name: 'Resolved', value: 62, percent: '47%', color: '#22c55e' }
];

const categoryData = [
  { name: 'Roads & Potholes', value: 36, color: '#ef4444' },
  { name: 'Waste & Dumping', value: 22, color: '#f97316' },
  { name: 'Streetlights', value: 14, color: '#eab308' },
  { name: 'Flooding & Drainage', value: 12, color: '#3b82f6' },
  { name: 'Water Problems', value: 9, color: '#3b82f6' }
];

const areasData = [
  { name: 'Downtown', count: 32 },
  { name: 'Riverside Park', count: 28 },
  { name: 'North Side', count: 21 },
  { name: 'West Loop', count: 17 },
  { name: 'Bridgeport', count: 15 }
];

const MapAnalytics = () => {
  return (
    <Card className="analytics-card mb-4 border-0 shadow-sm rounded-4">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1">Community Overview</h4>
            <p className="text-muted mb-0 small">Real-time overview of issues in the community.</p>
          </div>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" className="bg-white" id="dropdown-basic">
              This Month
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#/action-1">This Week</Dropdown.Item>
              <Dropdown.Item href="#/action-2">This Month</Dropdown.Item>
              <Dropdown.Item href="#/action-3">This Year</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <Row className="g-3 mb-5">
          <Col md>
            <div className="stat-box p-3 border rounded-3 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-wrapper icon-purple">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">128</h3>
                  <div className="fw-semibold small">Total Issues</div>
                  <div className="text-muted" style={{fontSize: '0.75rem'}}>All reported</div>
                </div>
              </div>
            </div>
          </Col>
          <Col md>
            <div className="stat-box p-3 border rounded-3 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-wrapper icon-green-light">
                  <ClipboardCheck size={24} />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">42</h3>
                  <div className="fw-semibold small">Verified Issues</div>
                  <div className="text-muted" style={{fontSize: '0.75rem'}}>Confirmed by community</div>
                </div>
              </div>
            </div>
          </Col>
          <Col md>
            <div className="stat-box p-3 border rounded-3 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-wrapper icon-orange">
                  <Wrench size={24} />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">24</h3>
                  <div className="fw-semibold small">In Progress</div>
                  <div className="text-muted" style={{fontSize: '0.75rem'}}>Being addressed</div>
                </div>
              </div>
            </div>
          </Col>
          <Col md>
            <div className="stat-box p-3 border rounded-3 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-wrapper icon-green">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">62</h3>
                  <div className="fw-semibold small">Resolved</div>
                  <div className="text-muted" style={{fontSize: '0.75rem'}}>Successfully fixed</div>
                </div>
              </div>
            </div>
          </Col>
          <Col md>
            <div className="stat-box p-3 border rounded-3 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-wrapper icon-red">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">10.4K</h3>
                  <div className="fw-semibold small">Community Members</div>
                  <div className="text-muted" style={{fontSize: '0.75rem'}}>Active participants</div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={4}>
            <h6 className="fw-bold mb-4">Issues by Severity</h6>
            <div className="d-flex align-items-center">
              <div style={{ width: '160px', height: '160px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-grow-1 ms-2">
                {severityData.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2 small">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: item.color }}></div>
                      <span className="fw-medium text-dark">{item.name}</span>
                    </div>
                    <div className="text-muted">
                      <span className="text-dark fw-medium me-1">{item.value}</span>
                      ({item.percent})
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-3">
               <span className="text-muted" style={{fontSize: '0.7rem'}}>Percentages may exceed 100%</span>
            </div>
          </Col>

          <Col lg={4} className="border-start border-end px-4">
            <h6 className="fw-bold mb-4">Top Issue Categories</h6>
            <div className="category-bars">
              {categoryData.map((item, index) => (
                <div key={index} className="mb-3 d-flex align-items-center">
                  <div style={{ width: '140px' }} className="small fw-medium text-dark">{item.name}</div>
                  <div className="flex-grow-1 mx-2 bg-light rounded-pill" style={{ height: '6px' }}>
                    <div 
                      className="h-100 rounded-pill" 
                      style={{ 
                        width: `${(item.value / 36) * 100}%`, 
                        backgroundColor: item.color 
                      }}
                    ></div>
                  </div>
                  <div className="small fw-bold">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 pt-2">
              <a href="#" className="text-primary text-decoration-none small fw-semibold">View all categories <ArrowRight size={14} /></a>
            </div>
          </Col>

          <Col lg={4} className="ps-4">
            <h6 className="fw-bold mb-4">Most Active Areas</h6>
            <div className="active-areas-list">
              {areasData.map((item, index) => (
                <div key={index} className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <span className="small fw-medium text-dark">{item.name}</span>
                  <span className="small text-muted"><span className="text-dark fw-medium">{item.count}</span> issues</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 pt-1">
              <a href="#" className="text-primary text-decoration-none small fw-semibold">View all areas <ArrowRight size={14} /></a>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default MapAnalytics;
