from django.http import HttpResponse
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

def generate_itinerary_pdf(request):
    data = request.data
    buffer = BytesIO()
    
    try:
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        
        # 1. Title Section
        title_data = [[f"{data['name']} Itinerary"]]
        title_table = Table(title_data, colWidths=[6*inch])
        title_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 16),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(title_table)
        elements.append(Spacer(1, 24))
        
        # 2. Trip Overview
        overview_data = [
            ["Trip Overview", ""],
            ["Start Date", data['start_date']],
            ["End Date", data['end_date']],
            ["Total Days", str(data['days'])],
            ["Total Price", f"${float(data['total_price']):,.2f}" if data.get('total_price') else "Not specified"],
        ]
        
        overview_table = Table(overview_data, colWidths=[2*inch, 4*inch])
        overview_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('SPAN', (0, 0), (-1, 0)),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(overview_table)
        elements.append(Spacer(1, 24))
        
        # 3. Daily Itinerary
        for day in data['detail']:
            # Day header
            day_header = [[f"Day {day['day_number']}: {day['title']} - {day['date']}"]]
            day_table = Table(day_header, colWidths=[6*inch])
            day_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(day_table)
            
            # Places to visit
            places_data = [["Places to Visit:", ""]]
            for place in day['place']:
                places_data.append([place['title'], place['description']])
            
            places_table = Table(places_data, colWidths=[2*inch, 4*inch])
            places_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('SPAN', (0, 0), (-1, 0)),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(places_table)
            elements.append(Spacer(1, 12))
            
            # Accommodation
            camp = day['camp']
            accommodation_data = [
                ["Accommodation:", ""],
                [camp['name'], camp['description']]
            ]
            
            # Room options if available
            if camp.get('rooms'):
                accommodation_data.append(["Room Options:", ""])
                for room in camp['rooms']:
                    accommodation_data.append([
                        f"{room['name']} (Capacity: {room['capacity']})",
                        f"${float(room['price_per_night']):,.2f}" if room.get('price_per_night') else "Not specified"
                    ])
            
            accommodation_table = Table(accommodation_data, colWidths=[2*inch, 4*inch])
            accommodation_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('SPAN', (0, 0), (-1, 0)),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(accommodation_table)
            elements.append(PageBreak())
        
        doc.build(elements)
        buffer.seek(0)
        
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{data["name"]}_Itinerary.pdf"'
        return response
        
    except Exception as e:
        # Handle any errors that occur during PDF generation
        return HttpResponse(f"Error generating PDF: {str(e)}", status=500)
    
    finally:
        buffer.close()