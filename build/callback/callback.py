import os
import requests
import json

# GraphQL endpoint
GRAPHQL_URL = "https://wikibase-metadata.toolforge.org/graphql"

# GraphQL mutation
MUTATION = """
mutation AddWikibaseMutation($wikibaseName: String!, $baseUrl: String!) {
  addWikibase(wikibaseInput: {wikibaseName: $wikibaseName, urls: {baseUrl: $baseUrl}}) {
    id
  }
}
"""

def main():
    """
    Sends a GraphQL mutation to add a new Wikibase instance.
    Reads WIKIBASE_NAME and BASE_URL from environment variables.
    """
    wikibase_name = os.environ.get("WIKIBASE_NAME")
    base_url = os.environ.get("BASE_URL")

    if not wikibase_name:
        print("Error: WIKIBASE_NAME environment variable not set.")
        return
    if not base_url:
        print("Error: BASE_URL environment variable not set.")
        return

    variables = {
        "wikibaseName": wikibase_name,
        "baseUrl": base_url
    }

    payload = {
        "query": MUTATION,
        "variables": variables
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(GRAPHQL_URL, headers=headers, data=json.dumps(payload))
        response.raise_for_status()  # Raise an exception for HTTP errors
        print("Mutation successful:")
        print(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error sending GraphQL request: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response content: {e.response.text}")

if __name__ == "__main__":
    main()
