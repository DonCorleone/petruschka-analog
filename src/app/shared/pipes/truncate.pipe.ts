import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(text: string, maxLength: number = 150): string {
    if (!text) return '';
    
    // Strip HTML tags
    const stripped = text.replace(/<[^>]*>/g, '');
    
    // Truncate and add ellipsis if needed
    if (stripped.length <= maxLength) {
      return stripped;
    }
    
    return stripped.substring(0, maxLength).trim() + '...';
  }
}
