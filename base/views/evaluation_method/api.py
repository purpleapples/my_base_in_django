from base.models import EvaluationMethod
from common.cbvs import ApiView


class EvaluationMethodApiView(ApiView):
	model = EvaluationMethod
	duplicate_field_list = [['year','evaluation_type','method_name']]


def get_evaluation_result(year, evaluation_target, total_list):
	from base.models import EvaluationMethod
	evaluation_qs = EvaluationMethod.objects.filter(target=evaluation_target)
	if evaluation_qs.exists():
		evaluation_method = evaluation_qs.order_by('year').last()
		highest_goal = int(evaluation_method.highest_goal_percent * total_list[0])
		lowest_goal = int(evaluation_method.lowest_goal_percent * total_list[0])
		evaluation_grade = round((total_list[1] - total_list[0]) / (highest_goal - lowest_goal) * 100, 2) \
		if highest_goal - lowest_goal != 0 else 0
		setattr(evaluation_method, 'goal_gap', highest_goal - lowest_goal)
		setattr(evaluation_method, 'highest_goal', highest_goal)
		setattr(evaluation_method, 'lowest_goal', lowest_goal)
		setattr(evaluation_method, 'grade', evaluation_grade)

		return evaluation_method
	else:
		return None