//This script is responsible for filling in the explanation text which is shown on the column on the right.

function fillTextDiv(vis)
{
    //Select both the h2 element and the p element by id.
	var h2Element = document.querySelector('h2#header-explanation')
	var pElement = document.querySelector('p#explanation-text')

	let h2Text = null
	let pText = null
    
    //Fill in the text, depending on the visualization.
	if(vis == 'vis1-mean')
	{
		h2Text = 'Average grade by state'
		pText = 'Higher values indicate better average performance by the students.'
	}
	else if(vis == 'vis1-top')
	{
		h2Text = 'Relative percentage of top scoring students'
		pText = 'Values higher than 1 indicate that the state had a higher percentage of students in the top one percent than expected given the number of students from the state (good). '
		pText += 'Values lower than 1 indicate the oposite, which means the state performed poorly.'
	}
	else if(vis == 'vis1-bottom')
	{
		h2Text = 'Relative percentage of bottom scoring students'
		pText = 'Values higher than 1 indicate that the state had a higher percentage of students in the bottom one percent than expected given the number of students from the state, which is bad. '
		pText += 'Values lower than 1 indicate the oposite, which means the state performed better than expected.'
	}
	if(vis == 'vis2-mean')
	{
		h2Text = 'Gini coefficient of average grades'
		pText = 'Values close to 0 indicate that all institutions in the state performed about the same, while values close to 1 indicate that the average grades are very unequal.'
	}
	else if(vis == 'vis2-top')
	{
		h2Text = 'Gini coefficient of relative percentage of top scoring students'
		pText = 'Values close to 0 indicate that all institutions have about the same number of top performing students, while values close to 1 indicate that a few institutions concentrate the top performers.'
	}
	else if(vis == 'vis2-bottom')
	{
		h2Text = 'Gini coefficient of relative percentage of bottom scoring students'
		pText = 'Values close to 0 indicate that all institutions have about the same number of low scoring students, while values close to 1 indicate that a few institutions have the worst students.'
	}

	h2Element.innerHTML = h2Text
	pElement.innerHTML = pText

}
