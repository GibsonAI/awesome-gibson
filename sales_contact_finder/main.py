#!/usr/bin/env python
import sys

from src.crew import SalesContactFinderCrew


def run():
    # Create an instance of the crew
    crew = SalesContactFinderCrew()

    # Define your inputs
    target_company = input("Enter Target Company: ")
    our_product = input("Describe your product: ")

    inputs = {"target_company": target_company, "our_product": our_product}

    # Execute the crew with the inputs
    result = crew.crew().kickoff(inputs)

    # Print the results
    print("\nResults:")
    print(result)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please specify a command: run")
        sys.exit(1)

    command = sys.argv[1]

    if command == "run":
        run()
