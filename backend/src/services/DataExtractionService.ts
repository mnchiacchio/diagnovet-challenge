// Servicio para extraer datos estructurados del texto OCR
// Utiliza patrones regex y procesamiento de texto

export class DataExtractionService {
  // Patrones de extracción para reportes veterinarios
  private patterns = {
    // Información del paciente
    patient: {
      name: /(?:paciente|nombre)[\s:]*([^\n\r]+)/i,
      species: /(?:especie|animal)[\s:]*([^\n\r]+)/i,
      breed: /(?:raza|breed)[\s:]*([^\n\r]+)/i,
      age: /(?:edad|age)[\s:]*([^\n\r]+)/i,
      weight: /(?:peso|weight)[\s:]*([^\n\r]+)/i,
      owner: /(?:propietario|dueño|owner|tutor)[\s:]*([^\n\r]+)/i
    },
    
    // Información del veterinario
    veterinarian: {
      name: /(?:dr\.?|m\.?v\.?|veterinario)[\s:]*([^\n\r]+)/i,
      license: /(?:mat\.?|lic\.?|matrícula)[\s:]*([^\n\r]+)/i,
      clinic: /(?:clínica|centro|hospital)[\s:]*([^\n\r]+)/i,
      contact: /(?:tel|teléfono|contacto)[\s:]*([^\n\r]+)/i
    },
    
    // Información del estudio
    study: {
      type: /(?:estudio|tipo)[\s:]*([^\n\r]+)/i,
      date: /(?:fecha|date)[\s:]*([^\n\r]+)/i,
      technique: /(?:técnica|método)[\s:]*([^\n\r]+)/i,
      bodyRegion: /(?:región|zona|área)[\s:]*([^\n\r]+)/i
    },
    
    // Contenido clínico
    clinical: {
      findings: /(?:hallazgos|se observa|findings)[\s:]*([^\n\r]+)/i,
      diagnosis: /(?:diagnóstico|impresión|diagnosis)[\s:]*([^\n\r]+)/i,
      recommendations: /(?:recomendaciones|tratamiento|recomendations)[\s:]*([^\n\r]+)/i
    }
  };

  // Extraer datos estructurados del texto
  async extractData(text: string) {
    const extractedData = {
      patient: {
        name: this.extractField(text, this.patterns.patient.name) || 'No especificado',
        species: this.extractField(text, this.patterns.patient.species) || 'No especificado',
        breed: this.extractField(text, this.patterns.patient.breed),
        age: this.extractField(text, this.patterns.patient.age),
        weight: this.extractField(text, this.patterns.patient.weight),
        owner: this.extractField(text, this.patterns.patient.owner) || 'No especificado'
      },
      
      veterinarian: {
        name: this.extractField(text, this.patterns.veterinarian.name) || 'No especificado',
        license: this.extractField(text, this.patterns.veterinarian.license),
        title: this.extractTitle(text),
        clinic: this.extractField(text, this.patterns.veterinarian.clinic),
        contact: this.extractField(text, this.patterns.veterinarian.contact),
        referredBy: this.extractReferredBy(text)
      },
      
      study: {
        type: this.extractField(text, this.patterns.study.type) || 'No especificado',
        date: this.extractDate(text),
        technique: this.extractField(text, this.patterns.study.technique),
        bodyRegion: this.extractField(text, this.patterns.study.bodyRegion),
        incidences: this.extractIncidences(text),
        equipment: this.extractEquipment(text),
        echoData: this.extractEchoData(text)
      },
      
      findings: this.extractField(text, this.patterns.clinical.findings),
      diagnosis: this.extractField(text, this.patterns.clinical.diagnosis),
      differentials: this.extractDifferentials(text),
      recommendations: this.extractRecommendations(text),
      measurements: this.extractMeasurements(text)
    };

    return extractedData;
  }

  // Extraer un campo específico usando regex
  private extractField(text: string, pattern: RegExp): string | null {
    const match = text.match(pattern);
    return match ? match[1].trim() : null;
  }

  // Extraer título del veterinario
  private extractTitle(text: string): string | null {
    const titlePatterns = [
      /(dr\.?|doctor)/i,
      /(m\.?v\.?|médico veterinario)/i,
      /(veterinario)/i
    ];

    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  // Extraer fecha del estudio
  private extractDate(text: string): string {
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      /(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return new Date().toISOString();
  }

  // Extraer incidencias del estudio
  private extractIncidences(text: string): string[] {
    const incidencePatterns = [
      /(?:incidencias|proyecciones)[\s:]*([^\n\r]+)/i,
      /(?:latero-lateral|ventro-dorsal|oblícuo)/gi
    ];

    const incidences: string[] = [];
    
    for (const pattern of incidencePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        if (Array.isArray(matches)) {
          incidences.push(...matches.slice(1));
        } else {
          incidences.push(matches);
        }
      }
    }

    return incidences.filter(inc => inc.trim().length > 0);
  }

  // Extraer equipamiento
  private extractEquipment(text: string): string | null {
    const equipmentPatterns = [
      /(?:equipo|equipamiento|máquina)[\s:]*([^\n\r]+)/i,
      /(?:digital|analógico|portátil)/i
    ];

    for (const pattern of equipmentPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  }

  // Extraer datos de ecocardiografía
  private extractEchoData(text: string): any {
    const echoPatterns = {
      fs: /(?:fracción de eyección|fs)[\s:]*([^\n\r]+)/i,
      fe: /(?:fracción de eyección|fe)[\s:]*([^\n\r]+)/i,
      lvidd: /(?:lvidd|diámetro diastólico)[\s:]*([^\n\r]+)/i,
      lvids: /(?:lvids|diámetro sistólico)[\s:]*([^\n\r]+)/i
    };

    const echoData: any = {};
    
    for (const [key, pattern] of Object.entries(echoPatterns)) {
      const match = text.match(pattern);
      if (match) {
        echoData[key] = match[1].trim();
      }
    }

    return Object.keys(echoData).length > 0 ? echoData : null;
  }

  // Extraer derivación
  private extractReferredBy(text: string): string | null {
    const referredPatterns = [
      /(?:derivado por|referido por)[\s:]*([^\n\r]+)/i,
      /(?:dra\.?|dr\.?)\s+([^\n\r]+)/i
    ];

    for (const pattern of referredPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  // Extraer diagnósticos diferenciales
  private extractDifferentials(text: string): string[] {
    const differentialPatterns = [
      /(?:diagnósticos diferenciales|diferenciales)[\s:]*([^\n\r]+)/i,
      /(?:1\.|2\.|3\.|4\.|5\.)\s*([^\n\r]+)/g
    ];

    const differentials: string[] = [];
    
    for (const pattern of differentialPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        differentials.push(...matches.map(match => match.trim()));
      }
    }

    return differentials.filter(diff => diff.length > 0);
  }

  // Extraer recomendaciones
  private extractRecommendations(text: string): string[] {
    const recommendationPatterns = [
      /(?:recomendaciones|tratamiento|sugerencias)[\s:]*([^\n\r]+)/i,
      /(?:1\.|2\.|3\.|4\.|5\.)\s*([^\n\r]+)/g
    ];

    const recommendations: string[] = [];
    
    for (const pattern of recommendationPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        recommendations.push(...matches.map(match => match.trim()));
      }
    }

    return recommendations.filter(rec => rec.length > 0);
  }

  // Extraer mediciones específicas
  private extractMeasurements(text: string): any {
    const measurementPatterns = {
      weight: /(?:peso|weight)[\s:]*([^\n\r]+)/i,
      temperature: /(?:temperatura|temp)[\s:]*([^\n\r]+)/i,
      heartRate: /(?:frecuencia cardíaca|fc)[\s:]*([^\n\r]+)/i,
      respiratoryRate: /(?:frecuencia respiratoria|fr)[\s:]*([^\n\r]+)/i
    };

    const measurements: any = {};
    
    for (const [key, pattern] of Object.entries(measurementPatterns)) {
      const match = text.match(pattern);
      if (match) {
        measurements[key] = match[1].trim();
      }
    }

    return Object.keys(measurements).length > 0 ? measurements : null;
  }
}
