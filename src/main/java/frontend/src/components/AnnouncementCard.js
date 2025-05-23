import React from "react";

const AnnouncementCard = ({
                              id,
                              text,
                              editable,
                              editingText,
                              onChangeText,
                              onSaveEdit,
                              onCancelEdit,
                              onEditClick,
                              onDelete,
                              canEdit = false,
                          }) => {
    return (
        <div style={styles.card}>
            {editable ? (
                <>
          <textarea
              rows={2}
              value={editingText}
              onChange={(e) => onChangeText(e.target.value)}
              style={styles.textarea}
          />
                    <div style={styles.buttonRow}>
                        <button onClick={onSaveEdit} style={styles.saveButton}>
                            Save
                        </button>
                        <button onClick={onCancelEdit} style={styles.cancelButton}>
                            Cancel
                        </button>
                    </div>
                </>
            ) : (
                <div style={styles.viewMode}>
                    <span>{text}</span>
                    {canEdit && (
                        <div style={styles.buttonRow}>
                            <button onClick={onEditClick} style={styles.editButton}>
                                Edit
                            </button>
                            <button onClick={onDelete} style={styles.deleteButton}>
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "16px",
        maxWidth: "100%",
        width: "100%",
        boxSizing: "border-box",
        background: "rgba(255, 255, 255, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
        color: "black",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
    },
    textarea: {
        maxWidth: "100%",
        padding: "8px",
        fontSize: "14px",
        borderRadius: "4px",
        border: "1px solid #bbb",
        resize: "none",
    },
    buttonRow: {
        display: "flex",
        gap: "8px",
        marginTop: "8px",
        flexWrap: "wrap",
    },
    saveButton: {
        backgroundColor: "#007bff",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
    },
    cancelButton: {
        backgroundColor: "#6c757d",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
    },
    editButton: {
        backgroundColor: "#6c757d",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
    },
    deleteButton: {
        backgroundColor: "#dc3545",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
    },
    viewMode: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "10px",
    },
};

export default AnnouncementCard;
