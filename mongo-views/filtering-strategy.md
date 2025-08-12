# Streamlined GoogleAnalyticsTracker Filtering

## 🎯 **Unified Filter Strategy**

All endpoints now use consistent regex-based filtering on the `googleAnalyticsTracker` field to handle multi-category documents like `"Tournee|CD"`.

## 📋 **Endpoint Filter Mapping**

### **1. Music Section (CD Albums)**
**Endpoint:** `/api/v1/albums`
```javascript
const query = { 'googleAnalyticsTracker': { $regex: "CD", $options: "i" } };
```
**Matches:** `"CD"`, `"Tournee|CD"`, `"CD|Something"`

### **2. Merch Section (Tournee Items)**
**Endpoint:** `/api/v1/merch` 
```javascript
const query = { "googleAnalyticsTracker": { $regex: "Tournee", $options: "i" } };
```
**Matches:** `"Tournee"`, `"Tournee|CD"`, `"Something|Tournee"`

### **3. Active Gigs (All Ticketable Events)**
**Endpoint:** `/api/v1/gigs`
```javascript
const query = { 'googleAnalyticsTracker': { $regex: "CD|Tournee", $options: "i" } };
```
**Matches:** Documents containing either "CD" OR "Tournee"

### **4. Individual Gig Details**
**Endpoint:** `/api/v1/gig/[id]`
```javascript
const query = { 
  _id: templateId,
  'googleAnalyticsTracker': { $regex: "CD|Tournee", $options: "i" }
};
```
**Matches:** Specific ID + ticketable sections

### **5. Updates/Promo (All Sections)**
**Endpoint:** `/api/v1/updates`
```javascript
const query = { 'googleAnalyticsTracker': { $regex: "CD|Tournee", $options: "i" } };
```
**Matches:** Documents from any ticketable section for promotional content

### **6. Past Events (History Section)**
**Endpoint:** `/api/v1/past-events`
```javascript
const query = { 
  'premiereDate': { $exists: true },
  'googleAnalyticsTracker': { $regex: "CD|Tournee", $options: "i" }
};
```
**Matches:** Historical events from ticketable sections

### **7. Individual Past Event Details**
**Endpoint:** `/api/v1/past-event/[id]`
```javascript
const query = { 
  _id: searchId,
  'googleAnalyticsTracker': { $regex: "CD|Tournee", $options: "i" }
};
```
**Matches:** Specific historical event + section validation

## 🔧 **Technical Benefits**

### **Multi-Category Support**
- Handles combined values like `"Tournee|CD"` seamlessly
- Single document can appear in multiple sections
- No need for complex array queries

### **Performance Optimization**
- Regex with index support (when properly indexed)
- Consistent query patterns across all endpoints
- Reduces query complexity

### **Maintainability**
- Unified approach across all endpoints
- Easy to add new categories
- Clear section-based organization

## 📊 **Data Flow Example**

**Document:** 
```json
{
  "_id": "2017t",
  "name": "De schlaui Igel Pic",
  "googleAnalyticsTracker": "Tournee|CD",
  "premiereDate": "2020-12-05T13:30:00.000Z"
}
```

**Endpoint Results:**
- ✅ `/api/v1/albums` - Appears (contains "CD")
- ✅ `/api/v1/merch` - Appears (contains "Tournee") 
- ✅ `/api/v1/gigs` - Appears (contains "CD|Tournee")
- ✅ `/api/v1/past-events` - Appears (has premiereDate + sections)
- ✅ `/api/v1/updates` - Appears (ticketable content)

## 🎯 **Consistency Achieved**

All endpoints now use the same filtering philosophy:
1. **Section-based filtering** via `googleAnalyticsTracker` regex
2. **Multi-category support** for combined values
3. **Performance optimized** queries
4. **Maintainable and scalable** architecture

This unified approach eliminates the issue you encountered and creates a consistent, powerful filtering system! 🚀
