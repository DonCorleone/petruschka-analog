import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(text: string, maxLength: number = 150, preserveHtml: boolean = false): string {
    if (!text) return '';
    
    if (preserveHtml) {
      // For HTML content, check length of text without tags
      const stripped = text.replace(/<[^>]*>/g, '');
      
      if (stripped.length <= maxLength) {
        return text; // Return original HTML if short enough
      }
      
      // Truncate HTML content while preserving tags
      let charCount = 0;
      let result = '';
      let inTag = false;
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (char === '<') {
          inTag = true;
        }
        
        result += char;
        
        if (!inTag) {
          charCount++;
          if (charCount >= maxLength) {
            result += '...';
            break;
          }
        }
        
        if (char === '>') {
          inTag = false;
        }
      }
      
      return result;
    } else {
      // Strip HTML tags for plain text mode
      const stripped = text.replace(/<[^>]*>/g, '');
      
      // Truncate and add ellipsis if needed
      if (stripped.length <= maxLength) {
        return stripped;
      }
      
      return stripped.substring(0, maxLength).trim() + '...';
    }
  }
}
