from datetime import datetime


class Note:
    def __init__(self, title: str, text: str, date_created: datetime = None, date_last_updated: datetime = None, id: int = None, cluster: str = None):
        self.id = id
        self.title = title
        self.text = text
        self.date_created = date_created or datetime.now()
        self.date_last_updated = date_last_updated or self.date_created
        self.cluster = cluster

    def update_text(self, new_text: str):
        self.text = new_text
        self.date_last_updated = datetime.now()

    def __repr__(self):
        return f"<Note id={self.id} title='{self.title}' cluster={self.cluster} created={self.date_created} updated={self.date_last_updated}>"
