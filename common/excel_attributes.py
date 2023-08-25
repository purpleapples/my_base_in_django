from openpyxl.styles import Font, Side, Alignment, PatternFill, Border

def get_openpyxl_default_document_attribute():
	attribute_dict = {}
	attribute_dict['code_font1'] = Font(name='맑은고딕', size=12, bold=True)
	attribute_dict['code_font2'] = Font(name='맑은고딕', size=8, bold=True)
	attribute_dict['header_font'] = Font(name='맑은고딕', size=8, bold=True)
	attribute_dict['content_font'] = Font(name='맑은고딕', size=8)
	side = Side(border_style='thick', color='FF000000')
	thin_side = Side(border_style='thin', color='FF000000')
	attribute_dict['alignment'] = Alignment(horizontal='center', vertical='center')
	attribute_dict['header_fill'] = PatternFill(start_color="C0C0C0", end_color="C0C0C0", fill_type="solid")
	attribute_dict['header_border'] = Border(bottom=side, top=thin_side, left=thin_side, right=thin_side)
	attribute_dict['content_border'] = Border(bottom=thin_side, top=thin_side, left=thin_side, right=thin_side)

	return attribute_dict