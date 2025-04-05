package models

// DomainMapping stores the mapping of email domains to Google Drive folder URLs
type DomainMapping struct {
	ID          uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Domain      string `json:"domain"`
	DriveURL    string `json:"drive_url"`
	Description string `json:"description"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`
	CreatedAt   int64  `json:"created_at"`
}

// DefaultMapping represents the default/fallback mapping when a domain is not found
type DefaultMapping struct {
	ID        uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	DriveURL  string `json:"drive_url"`
	UpdatedAt int64  `json:"updated_at"`
	UpdatedBy uint   `json:"updated_by"` // Admin user ID who last updated this
}

// AccessLog records user access to drive folders
type AccessLog struct {
	ID        uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint   `json:"user_id"`
	Domain    string `json:"domain"`
	DriveURL  string `json:"drive_url"`
	Timestamp int64  `json:"timestamp"`
	IPAddress string `json:"ip_address"`
	UserAgent string `json:"user_agent"`
}
