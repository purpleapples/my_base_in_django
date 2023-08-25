
def save_excel_content(excel):

	function_map = dict(
		income = '',
		income_detail = '',
		cost_of_labor = '',
		guest_lecturer = ''
	)

	return function_map[excel.kind](excel)