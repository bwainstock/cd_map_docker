FROM python:onbuild
CMD ["/usr/local/bin/gunicorn", "-c", "gunicorn.conf", "-w", "2", "-b", ":8000", "app:app"]
