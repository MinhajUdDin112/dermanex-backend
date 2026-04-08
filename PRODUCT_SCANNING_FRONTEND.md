// Frontend Integration Examples

// ==========================================
// REACT EXAMPLE
// ==========================================

import React, { useState } from 'react';

interface ProductAnalysis {
productId: string;
productName: string;
brand: string;
compatibilityScore: number;
compatibilityAlerts: Array<{
severity: 'warning' | 'danger' | 'info';
message: string;
ingredient: string;
}>;
ingredientAnalysis: Array<{
name: string;
safetyLevel: string;
benefits: string[];
concerns: string[];
}>;
labels: string[];
aiInsights: {
summary?: string;
recommendations?: string[];
};
}

export function BarcodeScanner() {
const [barcode, setBarcode] = useState('');
const [loading, setLoading] = useState(false);
const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
const [error, setError] = useState<string | null>(null);

const scanBarcode = async () => {
setLoading(true);
setError(null);

    try {
      const token = localStorage.getItem('jwtToken'); // Your JWT token

      const response = await fetch('https://your-api.com/products/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode }),
      });

      if (!response.ok) {
        throw new Error('Failed to scan barcode');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }

};

return (

<div className="barcode-scanner">
<div className="input-group">
<input
type="text"
placeholder="Enter barcode..."
value={barcode}
onChange={(e) => setBarcode(e.target.value)}
onKeyPress={(e) => e.key === 'Enter' && scanBarcode()}
/>
<button onClick={scanBarcode} disabled={loading}>
{loading ? 'Scanning...' : 'Scan'}
</button>
</div>

      {error && <div className="error">{error}</div>}

      {analysis && (
        <div className="analysis-results">
          {/* Compatibility Score */}
          <div className="score-card">
            <div className="score-circle">
              <span className="score">{analysis.compatibilityScore}%</span>
            </div>
            <span className="label">Compatibility</span>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h2>{analysis.productName}</h2>
            <p className="brand">{analysis.brand}</p>
          </div>

          {/* Alerts */}
          {analysis.compatibilityAlerts.length > 0 && (
            <div className="alerts">
              <h3>⚠️ Compatibility Alerts</h3>
              {analysis.compatibilityAlerts.map((alert, idx) => (
                <div key={idx} className={`alert alert-${alert.severity}`}>
                  <strong>{alert.ingredient}:</strong> {alert.message}
                </div>
              ))}
            </div>
          )}

          {/* Ingredients */}
          <div className="ingredients">
            <h3>Ingredients</h3>
            {analysis.ingredientAnalysis.map((ing, idx) => (
              <div key={idx} className="ingredient-card">
                <div className="ingredient-header">
                  <h4>{ing.name}</h4>
                  <span className={`safety ${ing.safetyLevel.toLowerCase()}`}>
                    {ing.safetyLevel}
                  </span>
                </div>
                {ing.benefits.length > 0 && (
                  <div className="benefits">
                    <strong>Benefits:</strong> {ing.benefits.join(', ')}
                  </div>
                )}
                {ing.concerns.length > 0 && (
                  <div className="concerns">
                    <strong>Concerns:</strong> {ing.concerns.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Labels */}
          {analysis.labels.length > 0 && (
            <div className="labels">
              {analysis.labels.map((label, idx) => (
                <span key={idx} className="label-tag">
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* AI Insights */}
          {analysis.aiInsights?.summary && (
            <div className="ai-insights">
              <h3>AI Insights</h3>
              <p>{analysis.aiInsights.summary}</p>
              {analysis.aiInsights.recommendations && (
                <div className="recommendations">
                  <strong>Recommendations:</strong>
                  <ul>
                    {analysis.aiInsights.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>

);
}

// ==========================================
// VANILLA JAVASCRIPT EXAMPLE
// ==========================================

async function scanProductBarcode(barcode, jwtToken) {
try {
const response = await fetch('https://your-api.com/products/scan', {
method: 'POST',
headers: {
'Authorization': `Bearer ${jwtToken}`,
'Content-Type': 'application/json',
},
body: JSON.stringify({ barcode }),
});

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const analysis = await response.json();
    displayProductAnalysis(analysis);
    return analysis;

} catch (error) {
console.error('Error scanning barcode:', error);
displayError(error.message);
}
}

function displayProductAnalysis(analysis) {
// Clear previous results
const resultsDiv = document.getElementById('results');
resultsDiv.innerHTML = '';

// Create score circle
const scoreHTML = `     <div class="compatibility-score">
      <div class="score-circle" style="background: ${getColorForScore(analysis.compatibilityScore)}">
        <span>${analysis.compatibilityScore}%</span>
      </div>
      <span>Compatibility</span>
    </div>
  `;

// Create product info
const productHTML = `     <div class="product-info">
      <h2>${analysis.productName}</h2>
      <p class="brand">${analysis.brand}</p>
      <p class="category">${analysis.productCategory}</p>
    </div>
  `;

// Create alerts
const alertsHTML = analysis.compatibilityAlerts.length > 0
? `     <div class="alerts">
      <h3>Compatibility Alerts</h3>
      ${analysis.compatibilityAlerts
        .map(
          (alert) =>
            `<div class="alert alert-${alert.severity}">
<strong>${alert.ingredient}:</strong> ${alert.message}

</div>`,
        )
        .join('')}
    </div>
  `
: '';

// Create ingredients section
const ingredientsHTML = `     <div class="ingredients">
      <h3>Ingredient Analysis</h3>
      ${analysis.ingredientAnalysis
        .map(
          (ing) =>
            `

<div class="ingredient">
<h4>${ing.name} <span class="safety ${ing.safetyLevel.toLowerCase()}">${ing.safetyLevel}</span></h4>
${ing.benefits.length > 0 ? `<p><strong>Benefits:</strong> ${ing.benefits.join(', ')}</p>` : ''}
${ing.concerns.length > 0 ? `<p><strong>Concerns:</strong> ${ing.concerns.join(', ')}</p>` : ''}
</div>
`,
        )
        .join('')}
    </div>
  `;

// Create labels
const labelsHTML =
analysis.labels.length > 0
? `    <div class="labels">
      <h3>Product Labels</h3>
      ${analysis.labels.map((label) =>`<span class="tag">${label}</span>`).join('')}
    </div>
  `
: '';

// Combine all HTML
resultsDiv.innerHTML = scoreHTML + productHTML + alertsHTML + ingredientsHTML + labelsHTML;
}

function getColorForScore(score) {
if (score >= 80) return '#10b981'; // Green
if (score >= 60) return '#f59e0b'; // Orange
return '#ef4444'; // Red
}

function displayError(message) {
const resultsDiv = document.getElementById('results');
resultsDiv.innerHTML = `<div class="error"><p>❌ ${message}</p></div>`;
}

// ==========================================
// IMAGE ANALYSIS EXAMPLE
// ==========================================

async function analyzeProductImage(imageFile, jwtToken) {
try {
// Convert image to base64
const base64 = await fileToBase64(imageFile);

    const response = await fetch('https://your-api.com/products/analyze-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    const analysis = await response.json();
    displayProductAnalysis(analysis);
    return analysis;

} catch (error) {
console.error('Error analyzing image:', error);
displayError(error.message);
}
}

function fileToBase64(file) {
return new Promise((resolve, reject) => {
const reader = new FileReader();
reader.readAsDataURL(file);
reader.onload = () => {
const result = reader.result;
// Extract base64 without the data:image/jpeg;base64, prefix
const base64String = typeof result === 'string' ? result.split(',')[1] : '';
resolve(base64String);
};
reader.onerror = (error) => reject(error);
});
}

// ==========================================
// EXAMPLE USAGE IN HTML
// ==========================================

/\*

<html>
  <body>
    <div class="container">
      <h1>Product Analysis</h1>

      <div class="scan-section">
        <input
          type="text"
          id="barcodeInput"
          placeholder="Enter or scan barcode..."
        />
        <button onclick="handleScan()">Scan</button>

        <input
          type="file"
          id="imageInput"
          accept="image/*"
          onchange="handleImageUpload(event)"
        />
        <label for="imageInput">Or upload product image</label>
      </div>

      <div id="results"></div>
    </div>

    <script>
      const jwtToken = localStorage.getItem('jwtToken');

      function handleScan() {
        const barcode = document.getElementById('barcodeInput').value;
        if (barcode.trim()) {
          scanProductBarcode(barcode, jwtToken);
        }
      }

      function handleImageUpload(event) {
        const file = event.target.files?.[0];
        if (file) {
          analyzeProductImage(file, jwtToken);
        }
      }
    </script>

    <style>
      .compatibility-score {
        text-align: center;
        margin: 20px 0;
      }

      .score-circle {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        color: white;
        font-size: 32px;
        font-weight: bold;
      }

      .alerts {
        margin: 20px 0;
        padding: 15px;
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
        border-radius: 4px;
      }

      .alert-danger {
        background: #fee2e2;
        border-left-color: #ef4444;
        color: #dc2626;
      }

      .ingredient {
        padding: 12px;
        margin: 8px 0;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
      }

      .safety {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.85em;
        font-weight: bold;
        margin-left: 10px;
      }

      .safety.safe {
        background: #d1fae5;
        color: #065f46;
      }

      .safety.caution {
        background: #fef3c7;
        color: #92400e;
      }

      .safety.unsafe {
        background: #fee2e2;
        color: #991b1b;
      }

      .tag {
        display: inline-block;
        background: #e0e7ff;
        color: #312e81;
        padding: 6px 12px;
        border-radius: 20px;
        margin: 4px;
        font-size: 0.9em;
      }
    </style>

  </body>
</html>
*/

export { scanProductBarcode, analyzeProductImage, displayProductAnalysis };
