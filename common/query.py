
## postgresql
def create_hierarchical_query(model, parent_condition, connect_condition):
	from django.db import connection
	# queryString의 경우 db engine 을 확인 후 설정
	result = ''
	with connection.cursor() as cursor:
		query_string = f''' with recursive cte_query as(
		select * from {model} e
			where {parent_condition}
		union all
			select e.* from code_table e
		inner join cte_query c On {connect_condition}
		)
		select * from cte_query'''
		cursor.execute(query_string)
		result = cursor.fetchall()
	return result
