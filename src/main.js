import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.draggable.js';
import '@svgdotjs/svg.panzoom.js';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

class SVGEditor {
  constructor() {
    this.canvas = SVG().addTo('#svgCanvas').size('100%', '100%');
    this.sections = new Map();
    this.selectedElement = null;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.getElementById('addSection').addEventListener('click', () => this.addSection());
    document.getElementById('addSubSection').addEventListener('click', () => this.addSubSection());
    document.getElementById('uploadSvg').addEventListener('click', () => this.handleSvgUpload());
    document.getElementById('addText').addEventListener('click', () => this.addText());
    document.getElementById('exportAll').addEventListener('click', () => this.exportAll());
    document.getElementById('exportSection').addEventListener('click', () => this.exportSection());

    // Property panel listeners
    ['elementId', 'posX', 'posY', 'width', 'height'].forEach(id => {
      document.getElementById(id).addEventListener('change', (e) => {
        this.updateElementProperty(id, e.target.value);
      });
    });

    ['fillColor', 'strokeColor'].forEach(id => {
      document.getElementById(id).addEventListener('input', (e) => {
        this.updateElementColor(id, e.target.value);
      });
    });
  }

  addSection() {
    const sectionId = `section-${this.sections.size + 1}`;
    const section = this.canvas.group().attr({ id: sectionId });
    this.sections.set(sectionId, section);
    this.updateLayersList();
  }

  addSubSection(parentSectionId) {
    if (!parentSectionId) {
      alert('Please select a parent section first');
      return;
    }
    const parentSection = this.sections.get(parentSectionId);
    const subSectionId = `${parentSectionId}-sub-${parentSection.children().length + 1}`;
    const subSection = parentSection.group().attr({ id: subSectionId });
    this.updateLayersList();
  }

  handleSvgUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svg';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const svgContent = event.target.result;
        this.importSvg(svgContent);
      };
      reader.readAsText(file);
    };
    input.click();
  }

  importSvg(svgContent) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const importedSvg = this.canvas.svg(svgContent);
    importedSvg.draggable();
    this.updateLayersList();
  }

  addText() {
    const text = this.canvas.text('Double click to edit')
      .draggable()
      .attr({ 'font-family': 'Arial', 'font-size': 16 });
    
    text.on('dblclick', () => {
      const newText = prompt('Enter text:', text.text());
      if (newText !== null) {
        text.text(newText);
      }
    });
  }

  exportAll() {
    const svgContent = this.canvas.svg();
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    saveAs(blob, 'canvas.svg');
  }

  exportSection(sectionId) {
    if (!sectionId) {
      alert('Please select a section to export');
      return;
    }
    const section = this.sections.get(sectionId);
    const svgContent = section.svg();
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    saveAs(blob, `${sectionId}.svg`);
  }

  updateElementProperty(property, value) {
    if (!this.selectedElement) return;
    
    switch (property) {
      case 'elementId':
        this.selectedElement.attr('id', value);
        break;
      case 'posX':
      case 'posY':
        const x = property === 'posX' ? value : this.selectedElement.x();
        const y = property === 'posY' ? value : this.selectedElement.y();
        this.selectedElement.move(x, y);
        break;
      case 'width':
      case 'height':
        this.selectedElement.size(
          property === 'width' ? value : this.selectedElement.width(),
          property === 'height' ? value : this.selectedElement.height()
        );
        break;
    }
  }

  updateElementColor(property, value) {
    if (!this.selectedElement) return;
    
    if (property === 'fillColor') {
      this.selectedElement.fill(value);
    } else if (property === 'strokeColor') {
      this.selectedElement.stroke(value);
    }
  }

  updateLayersList() {
    const layersList = document.getElementById('layersList');
    layersList.innerHTML = '';
    
    this.sections.forEach((section, id) => {
      const sectionItem = document.createElement('div');
      sectionItem.textContent = id;
      sectionItem.classList.add('layer-item');
      sectionItem.onclick = () => this.selectElement(section);
      layersList.appendChild(sectionItem);
    });
  }

  selectElement(element) {
    if (this.selectedElement) {
      this.selectedElement.removeClass('selected');
    }
    this.selectedElement = element;
    element.addClass('selected');
    this.updatePropertyPanel();
  }

  updatePropertyPanel() {
    if (!this.selectedElement) return;
    
    document.getElementById('elementId').value = this.selectedElement.attr('id') || '';
    document.getElementById('posX').value = this.selectedElement.x() || 0;
    document.getElementById('posY').value = this.selectedElement.y() || 0;
    document.getElementById('width').value = this.selectedElement.width() || 0;
    document.getElementById('height').value = this.selectedElement.height() || 0;
    document.getElementById('fillColor').value = this.selectedElement.fill() || '#000000';
    document.getElementById('strokeColor').value = this.selectedElement.stroke() || '#000000';
  }
}

// Initialize the editor when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SVGEditor();
});