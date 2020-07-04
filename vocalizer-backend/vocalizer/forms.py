from django import forms

from .settings import MAX_TITLE_LENGTH


class UploadFileForm(forms.Form):
    title = forms.CharField(max_length=MAX_TITLE_LENGTH)
    file = forms.FileField()
