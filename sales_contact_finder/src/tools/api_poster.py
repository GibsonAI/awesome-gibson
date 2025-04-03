from crewai.tools import BaseTool
from pydantic import Field
import requests
import json


class ContactPosterTool(BaseTool):
    name: str = "ContactPosterTool"
    description: str = """
    Posts contact information to an API endpoints. Expected payload format:
    {"company_name": "Company Name", "contacts": [{"name": "Name", "title": "Title", "linkedin_url": "LinkedIn URL", "phone": "Phone", "email": "Email"}]}
    if values for phone and email are not available, they should be set to "N/A"
    """

    api_endpoint: str = Field(
        description="The API endpoint to post the contact information to"
    )
    api_key: str = Field(
        description="The API key associated with your GibsonAI project"
    )
    company_endpoint: str = Field(
        description="The API endpoint to post the company information to"
    )
    contact_endpoint: str = Field(
        description="The API endpoint to post the contact information to"
    )

    def __init__(self, api_url: str, api_key: str):
        super().__init__(
            api_endpoint=api_url,
            api_key=api_key,
            company_endpoint=f"{api_url}/v1/-/sales-company",
            contact_endpoint=f"{api_url}/v1/-/sales-contact",
        )

    def _run(self, contact_info: str) -> str:
        try:
            # Parse the contact info if it's a string
            if isinstance(contact_info, str):
                contact_data = json.loads(contact_info)
            else:
                contact_data = contact_info

            company_name = contact_data["company_name"]
            contacts = contact_data["contacts"]

            # insert company name to the database
            company_payload = {"name": company_name}
            response = requests.post(
                self.company_endpoint,
                json=company_payload,
                headers={"X-Gibson-API-Key": self.api_key},
            )
            response.raise_for_status()
            print(f"Successfully posted company to API: {response.status_code}")

            company_id = response.json()["id"]

            # now insert contacts to the database
            print(f"Contacts: {contacts}")
            for contact in contacts:
                print(f"PostingContact: {contact}")
                contact_payload = {
                    "company_id": company_id,
                    "name": contact["name"],
                    "title": contact["title"],
                    "linkedin_url": contact["linkedin_url"],
                    "phone": contact["phone"],
                    "email": contact["email"],
                }
                print("Contact Payload: ", contact_payload)
                response = requests.post(
                    self.contact_endpoint,
                    json=contact_payload,
                    headers={"X-Gibson-API-Key": self.api_key},
                )
                print("Response Status: ", response.status_code)
                print("Response Text: ", response.text)
                print(
                    f"Successfully posted contact {contact['name']} to API: {response.status_code}"
                )

        except json.JSONDecodeError:
            return "Failed to parse contact information. Please ensure it's in valid JSON format."
        except Exception as e:
            return f"Failed to post contact to API: {str(e)}"
