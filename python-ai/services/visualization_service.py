"""
Visualization Service for BioVerse
Creates 3D digital twins and health visualizations
"""

import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pyvista as pv
import base64
import io
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json

from .base_service import BaseService

class VisualizationService(BaseService):
    """Service for creating health visualizations and 3D digital twins"""
    
    def __init__(self):
        super().__init__("VisualizationService")
        self.is_ready = False
        self.plot_theme = "bioverse"
        self.color_palette = {
            'primary': '#0066CC',
            'secondary': '#00CC66',
            'warning': '#FF9900',
            'danger': '#FF3333',
            'success': '#00AA00',
            'info': '#3399FF'
        }
        
    async def initialize(self):
        """Initialize the visualization service"""
        try:
            # Set up custom theme
            self._setup_custom_theme()
            
            self.is_ready = True
            self.logger.info("Visualization service initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize visualization service: {e}")
            self.is_ready = False
            raise
    
    def _setup_custom_theme(self):
        """Set up custom BioVerse theme for plots"""
        # Custom color sequence for BioVerse
        self.bioverse_colors = [
            '#0066CC', '#00CC66', '#FF9900', '#FF3333', 
            '#9933FF', '#33CCFF', '#FF6699', '#99FF33'
        ]
    
    async def create_3d_health_twin(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create 3D digital health twin visualization"""
        try:
            # Create 3D human body model
            body_model = await self._create_3d_body_model(patient_data)
            
            # Create organ health visualization
            organ_health = await self._create_organ_health_viz(patient_data)
            
            # Create health flow visualization
            health_flow = await self._create_health_flow_viz(patient_data)
            
            return {
                'body_model': body_model,
                'organ_health': organ_health,
                'health_flow': health_flow,
                'metadata': {
                    'patient_id': patient_data.get('patient_id'),
                    'generated_at': datetime.now().isoformat(),
                    'health_score': patient_data.get('health_score', 50)
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error creating 3D health twin: {e}")
            return {'error': str(e)}
    
    async def _create_3d_body_model(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create 3D body model with health indicators"""
        try:
            # Create basic human body shape using PyVista
            plotter = pv.Plotter(off_screen=True)
            
            # Create body parts as simple geometric shapes
            # Head
            head = pv.Sphere(radius=0.8, center=(0, 0, 7))
            head_color = self._get_health_color(patient_data.get('head_health', 80))
            
            # Torso
            torso = pv.Cylinder(radius=1.2, height=4, center=(0, 0, 4))
            torso_color = self._get_health_color(patient_data.get('torso_health', 75))
            
            # Arms
            left_arm = pv.Cylinder(radius=0.3, height=3, center=(-2, 0, 5))
            right_arm = pv.Cylinder(radius=0.3, height=3, center=(2, 0, 5))
            arm_color = self._get_health_color(patient_data.get('arm_health', 85))
            
            # Legs
            left_leg = pv.Cylinder(radius=0.4, height=4, center=(-0.6, 0, 0))
            right_leg = pv.Cylinder(radius=0.4, height=4, center=(0.6, 0, 0))
            leg_color = self._get_health_color(patient_data.get('leg_health', 70))
            
            # Add to plotter with colors
            plotter.add_mesh(head, color=head_color, opacity=0.8)
            plotter.add_mesh(torso, color=torso_color, opacity=0.8)
            plotter.add_mesh(left_arm, color=arm_color, opacity=0.8)
            plotter.add_mesh(right_arm, color=arm_color, opacity=0.8)
            plotter.add_mesh(left_leg, color=leg_color, opacity=0.8)
            plotter.add_mesh(right_leg, color=leg_color, opacity=0.8)
            
            # Set camera and lighting
            plotter.camera_position = 'iso'
            plotter.add_light(pv.Light(position=(10, 10, 10)))
            
            # Render to image
            plotter.screenshot('temp_3d_model.png', transparent_background=True)
            plotter.close()
            
            # Convert to base64 for web display
            with open('temp_3d_model.png', 'rb') as img_file:
                img_base64 = base64.b64encode(img_file.read()).decode()
            
            return {
                'type': '3d_body_model',
                'image_base64': img_base64,
                'body_parts': {
                    'head': {'health': patient_data.get('head_health', 80), 'color': head_color},
                    'torso': {'health': patient_data.get('torso_health', 75), 'color': torso_color},
                    'arms': {'health': patient_data.get('arm_health', 85), 'color': arm_color},
                    'legs': {'health': patient_data.get('leg_health', 70), 'color': leg_color}
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error creating 3D body model: {e}")
            # Return fallback data
            return {
                'type': '3d_body_model',
                'fallback': True,
                'body_parts': {
                    'head': {'health': 80, 'color': 'green'},
                    'torso': {'health': 75, 'color': 'yellow'},
                    'arms': {'health': 85, 'color': 'green'},
                    'legs': {'health': 70, 'color': 'orange'}
                }
            }
    
    def _get_health_color(self, health_score: float) -> str:
        """Get color based on health score"""
        if health_score >= 80:
            return 'green'
        elif health_score >= 60:
            return 'yellow'
        elif health_score >= 40:
            return 'orange'
        else:
            return 'red'
    
    async def _create_organ_health_viz(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create organ health visualization"""
        try:
            organs = ['heart', 'lungs', 'liver', 'kidneys', 'brain']
            health_scores = [
                patient_data.get(f'{organ}_health', np.random.randint(60, 95))
                for organ in organs
            ]
            
            # Create radar chart for organ health
            fig = go.Figure()
            
            fig.add_trace(go.Scatterpolar(
                r=health_scores,
                theta=organs,
                fill='toself',
                name='Organ Health',
                line_color=self.color_palette['primary']
            ))
            
            fig.update_layout(
                polar=dict(
                    radialaxis=dict(
                        visible=True,
                        range=[0, 100]
                    )),
                showlegend=True,
                title="Organ Health Overview",
                font=dict(size=12)
            )
            
            # Convert to JSON for web display
            fig_json = fig.to_json()
            
            return {
                'type': 'organ_health_radar',
                'plotly_json': fig_json,
                'organ_scores': dict(zip(organs, health_scores))
            }
            
        except Exception as e:
            self.logger.error(f"Error creating organ health viz: {e}")
            return {'error': str(e)}
    
    async def _create_health_flow_viz(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create health flow/circulation visualization"""
        try:
            # Create animated flow visualization showing blood circulation
            # This is a simplified representation
            
            # Generate flow data
            time_points = np.linspace(0, 2*np.pi, 50)
            flow_data = []
            
            for t in time_points:
                # Simulate blood flow through major vessels
                flow_data.append({
                    'time': t,
                    'heart_flow': 50 + 20 * np.sin(t * 2),  # Heart pumping
                    'brain_flow': 30 + 10 * np.sin(t * 1.5),  # Brain circulation
                    'lung_flow': 40 + 15 * np.sin(t * 1.8),  # Lung circulation
                    'kidney_flow': 25 + 8 * np.sin(t * 1.2)   # Kidney circulation
                })
            
            # Create animated line plot
            fig = go.Figure()
            
            organs = ['heart_flow', 'brain_flow', 'lung_flow', 'kidney_flow']
            colors = [self.color_palette['danger'], self.color_palette['info'], 
                     self.color_palette['primary'], self.color_palette['warning']]
            
            for organ, color in zip(organs, colors):
                fig.add_trace(go.Scatter(
                    x=[d['time'] for d in flow_data],
                    y=[d[organ] for d in flow_data],
                    mode='lines',
                    name=organ.replace('_flow', '').title(),
                    line=dict(color=color, width=3)
                ))
            
            fig.update_layout(
                title="Health Flow Dynamics",
                xaxis_title="Time",
                yaxis_title="Flow Rate",
                showlegend=True,
                height=400
            )
            
            return {
                'type': 'health_flow',
                'plotly_json': fig.to_json(),
                'flow_data': flow_data[:10]  # Send first 10 points
            }
            
        except Exception as e:
            self.logger.error(f"Error creating health flow viz: {e}")
            return {'error': str(e)}
    
    async def create_health_dashboard(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create comprehensive health dashboard"""
        try:
            dashboard = {}
            
            # Vital signs chart
            dashboard['vitals'] = await self._create_vitals_chart(patient_data)
            
            # Health trends
            dashboard['trends'] = await self._create_health_trends(patient_data)
            
            # Risk factors
            dashboard['risk_factors'] = await self._create_risk_factors_viz(patient_data)
            
            # Health score gauge
            dashboard['health_score'] = await self._create_health_score_gauge(patient_data)
            
            return dashboard
            
        except Exception as e:
            self.logger.error(f"Error creating health dashboard: {e}")
            return {'error': str(e)}
    
    async def _create_vitals_chart(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create vital signs chart"""
        try:
            vitals = patient_data.get('vitals', {})
            
            # Create gauge charts for each vital sign
            fig = make_subplots(
                rows=2, cols=2,
                subplot_titles=('Heart Rate', 'Blood Pressure', 'Temperature', 'Oxygen Saturation'),
                specs=[[{'type': 'indicator'}, {'type': 'indicator'}],
                       [{'type': 'indicator'}, {'type': 'indicator'}]]
            )
            
            # Heart Rate
            fig.add_trace(go.Indicator(
                mode="gauge+number",
                value=vitals.get('heart_rate', 72),
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "BPM"},
                gauge={'axis': {'range': [None, 200]},
                       'bar': {'color': self.color_palette['danger']},
                       'steps': [{'range': [0, 60], 'color': "lightgray"},
                                {'range': [60, 100], 'color': "gray"}],
                       'threshold': {'line': {'color': "red", 'width': 4},
                                   'thickness': 0.75, 'value': 90}}
            ), row=1, col=1)
            
            # Blood Pressure (Systolic)
            fig.add_trace(go.Indicator(
                mode="gauge+number",
                value=vitals.get('systolic_bp', 120),
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "mmHg"},
                gauge={'axis': {'range': [None, 200]},
                       'bar': {'color': self.color_palette['primary']}}
            ), row=1, col=2)
            
            # Temperature
            fig.add_trace(go.Indicator(
                mode="gauge+number",
                value=vitals.get('temperature', 98.6),
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "°F"},
                gauge={'axis': {'range': [95, 105]},
                       'bar': {'color': self.color_palette['warning']}}
            ), row=2, col=1)
            
            # Oxygen Saturation
            fig.add_trace(go.Indicator(
                mode="gauge+number",
                value=vitals.get('oxygen_saturation', 98),
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "%"},
                gauge={'axis': {'range': [80, 100]},
                       'bar': {'color': self.color_palette['success']}}
            ), row=2, col=2)
            
            fig.update_layout(height=600, title="Vital Signs Dashboard")
            
            return {
                'type': 'vitals_dashboard',
                'plotly_json': fig.to_json()
            }
            
        except Exception as e:
            self.logger.error(f"Error creating vitals chart: {e}")
            return {'error': str(e)}
    
    async def _create_health_trends(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create health trends over time"""
        try:
            # Generate sample trend data
            dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(30, 0, -1)]
            
            health_score = patient_data.get('health_score', 75)
            # Generate realistic trend data around the current health score
            trend_data = [health_score + np.random.normal(0, 5) for _ in dates]
            
            fig = go.Figure()
            
            fig.add_trace(go.Scatter(
                x=dates,
                y=trend_data,
                mode='lines+markers',
                name='Health Score',
                line=dict(color=self.color_palette['primary'], width=3),
                marker=dict(size=6)
            ))
            
            # Add trend line
            z = np.polyfit(range(len(trend_data)), trend_data, 1)
            p = np.poly1d(z)
            trend_line = p(range(len(trend_data)))
            
            fig.add_trace(go.Scatter(
                x=dates,
                y=trend_line,
                mode='lines',
                name='Trend',
                line=dict(color=self.color_palette['secondary'], width=2, dash='dash')
            ))
            
            fig.update_layout(
                title="Health Score Trends (30 Days)",
                xaxis_title="Date",
                yaxis_title="Health Score",
                yaxis=dict(range=[0, 100]),
                height=400
            )
            
            return {
                'type': 'health_trends',
                'plotly_json': fig.to_json(),
                'trend_direction': 'improving' if z[0] > 0 else 'declining' if z[0] < 0 else 'stable'
            }
            
        except Exception as e:
            self.logger.error(f"Error creating health trends: {e}")
            return {'error': str(e)}
    
    async def _create_risk_factors_viz(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create risk factors visualization"""
        try:
            risk_factors = patient_data.get('risk_factors', [])
            
            if not risk_factors:
                # Generate sample risk factors
                risk_factors = [
                    {'factor': 'Hypertension', 'risk_level': 'medium', 'impact_score': 0.6},
                    {'factor': 'Sedentary Lifestyle', 'risk_level': 'low', 'impact_score': 0.3},
                    {'factor': 'Family History', 'risk_level': 'medium', 'impact_score': 0.5},
                    {'factor': 'Age', 'risk_level': 'low', 'impact_score': 0.2}
                ]
            
            factors = [rf['factor'] for rf in risk_factors]
            scores = [rf['impact_score'] * 100 for rf in risk_factors]
            colors = [self._get_risk_color(rf['risk_level']) for rf in risk_factors]
            
            fig = go.Figure(data=[
                go.Bar(
                    x=factors,
                    y=scores,
                    marker_color=colors,
                    text=[f"{score:.0f}%" for score in scores],
                    textposition='auto'
                )
            ])
            
            fig.update_layout(
                title="Health Risk Factors",
                xaxis_title="Risk Factor",
                yaxis_title="Impact Score (%)",
                height=400
            )
            
            return {
                'type': 'risk_factors',
                'plotly_json': fig.to_json(),
                'risk_summary': {
                    'total_factors': len(risk_factors),
                    'high_risk': len([rf for rf in risk_factors if rf['risk_level'] == 'high']),
                    'medium_risk': len([rf for rf in risk_factors if rf['risk_level'] == 'medium']),
                    'low_risk': len([rf for rf in risk_factors if rf['risk_level'] == 'low'])
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error creating risk factors viz: {e}")
            return {'error': str(e)}
    
    def _get_risk_color(self, risk_level: str) -> str:
        """Get color based on risk level"""
        color_map = {
            'high': self.color_palette['danger'],
            'medium': self.color_palette['warning'],
            'low': self.color_palette['success']
        }
        return color_map.get(risk_level, self.color_palette['info'])
    
    async def _create_health_score_gauge(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create health score gauge"""
        try:
            health_score = patient_data.get('health_score', 75)
            
            fig = go.Figure(go.Indicator(
                mode="gauge+number+delta",
                value=health_score,
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "Overall Health Score"},
                delta={'reference': 80},
                gauge={
                    'axis': {'range': [None, 100]},
                    'bar': {'color': self._get_health_color(health_score)},
                    'steps': [
                        {'range': [0, 40], 'color': "lightgray"},
                        {'range': [40, 70], 'color': "gray"},
                        {'range': [70, 100], 'color': "lightgreen"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 90
                    }
                }
            ))
            
            fig.update_layout(height=400)
            
            return {
                'type': 'health_score_gauge',
                'plotly_json': fig.to_json(),
                'score': health_score,
                'category': self._get_health_category(health_score)
            }
            
        except Exception as e:
            self.logger.error(f"Error creating health score gauge: {e}")
            return {'error': str(e)}
    
    def _get_health_category(self, score: float) -> str:
        """Get health category based on score"""
        if score >= 90:
            return 'Excellent'
        elif score >= 80:
            return 'Very Good'
        elif score >= 70:
            return 'Good'
        elif score >= 60:
            return 'Fair'
        elif score >= 40:
            return 'Poor'
        else:
            return 'Critical'
    
    async def export_visualization(self, viz_data: Dict[str, Any], format: str = 'png') -> bytes:
        """Export visualization to specified format"""
        try:
            if 'plotly_json' in viz_data:
                fig = go.Figure(json.loads(viz_data['plotly_json']))
                
                if format.lower() == 'png':
                    img_bytes = fig.to_image(format='png')
                elif format.lower() == 'svg':
                    img_bytes = fig.to_image(format='svg')
                elif format.lower() == 'html':
                    img_bytes = fig.to_html().encode()
                else:
                    raise ValueError(f"Unsupported format: {format}")
                
                return img_bytes
            else:
                raise ValueError("No plotly data found in visualization")
                
        except Exception as e:
            self.logger.error(f"Error exporting visualization: {e}")
            raise