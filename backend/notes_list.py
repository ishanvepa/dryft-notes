from note import Note


class NoteList:
    def __init__(self):
        self.notes = []
        self._id_counter = 1

    def add_note(self, note: Note):
        if note.id is None:
            note.id = self._id_counter
            self._id_counter += 1
        self.notes.append(note)

    def get_note_by_id(self, note_id: int):
        for note in self.notes:
            if note.id == note_id:
                return note
        return None

    def remove_note_by_id(self, note_id: int):
        self.notes = [note for note in self.notes if note.id != note_id]

    def get_notes_list(self):
        return self.notes

    def __repr__(self):
        return f"<NoteList notes={self.notes}>"
