-- Admin Insertion Explicitly

INSERT INTO public."users" (
    "id",
    "google_id",
    "email",
    "full_name",
    "avatar",
    "password",
    "address",
    "phone",
    "niyam",
    "mantra_chanted",
	"createdAt",
	"updatedAt",
    "role"
) VALUES (
    'your_uuid', 
	'your_google_id',
    'your_email',              
    'your_full_name',                          
    'your_avatar',    
    'your_password',      
    'your_address',                       
    'your_phone',                        
    0,                                    
    0,
	CURRENT_TIMESTAMP,
	CURRENT_TIMESTAMP,
    'ADMIN'                         
);

SELECT * FROM public."users";