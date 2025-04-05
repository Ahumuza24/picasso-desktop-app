package models

type User struct {
	ID         uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name       string `json:"name"`
	Email      string `gorm:"unique" json:"email"`
	Password   []byte `json:"-"`
	Role       string `gorm:"default:'user'" json:"role"` // user, admin
	Department string `json:"department"`
	CreatedAt  int64  `json:"created_at"`
	LastLogin  int64  `json:"last_login"`
}
